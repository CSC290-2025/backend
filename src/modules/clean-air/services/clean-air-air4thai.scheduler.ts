import { schedule, type ScheduledTask } from 'node-cron';
import { CleanAirModel } from '../models';
import type { Air4ThaiDistrictAirQuality, AirQualityCategory } from '../types';
import {
  Air4ThaiService,
  AIR4THAI_DISTRICT_NAMES,
  resolveCategory,
} from './clean-air-air4thai.service';
import { EventService } from '@/modules/Volunteer/services';
import { addressService } from '@/modules/citizens/services/addressG5.service';
import { FcmService } from '@/modules/emergency/services';
import { FcmModel } from '@/modules/emergency/models';
type DistrictAggregate = {
  sumPm25: number;
  sumAqi: number;
  count: number;
};

type DistricAddDataToArray = Map<string, DistrictAggregate>;

const {
  ensureBangkokDistrictAddress,
  createAirQualityRecord,
  hasAirQualityRecord,
} = CleanAirModel;

const BANGKOK_TIMEZONE = 'Asia/Bangkok';
const aggregates = new Map<string, DistrictAggregate>();
const latestSnapshot = new Map<string, Air4ThaiDistrictAirQuality>();

let activeDateKey = getBangkokDateKey();
let schedulerStarted = false;
let sampleJob: ScheduledTask | null = null;
let flushJob: ScheduledTask | null = null;

const POOR_AIR_QUALITY_CATEGORIES: ReadonlySet<AirQualityCategory> = new Set([
  'GOOD',
  'UNHEALTHY_FOR_SENSITIVE',
  'UNHEALTHY',
  'VERY_UNHEALTHY',
  'HAZARDOUS',
]);
const lastAlertedMeasurements = new Map<string, string>();

const AIR_CAMPAIGN_DESCRIPTION = `This poster is pointing at you for a reason. Our city's air is at a tipping point, and we are recruiting everyone for the fight.
The "Green Air Initiative" is a community-wide mission built on 5 simple, powerful actions everyone can take:
DRIVE LESS: Choose public transit, your bike, or your feet.
STOP BURNING: No more burning trash, leaves, or yard waste.
SAVE ENERGY: Reduce your consumption at home and work.
PLANT TREES: Help us create green lungs for our city.
VOLUNTEER: And most importantly, join us. Give your time and skills.
Don't wait for someone else to fix our future. The power is in your hands. Sign up.`;

const prepareDistrictarray = () => {
  AIR4THAI_DISTRICT_NAMES.forEach((district) => {
    if (!aggregates.has(district)) {
      aggregates.set(district, { sumPm25: 0, sumAqi: 0, count: 0 });
    }
  });
};

prepareDistrictarray();

const isSchedulerDisabled =
  process.env.G05_DISABLE_AIR4THAI_SCHEDULER === 'true' ||
  process.env.NODE_ENV === 'test';

const addDataToArray = (snapshot: Air4ThaiDistrictAirQuality[]) => {
  snapshot.forEach((record) => {
    latestSnapshot.set(record.district, record);
    const entry = aggregates.get(record.district);
    if (!entry) return;
    entry.sumPm25 += record.pm25;
    entry.sumAqi += record.aqi;
    entry.count += 1;
  });
};

const cloneAggregates = (): DistricAddDataToArray => {
  const snapshot: DistricAddDataToArray = new Map();
  aggregates.forEach((value, district) => {
    snapshot.set(district, { ...value });
  });
  return snapshot;
};

const resetAggregates = () => {
  aggregates.clear();
  prepareDistrictarray();
};

const runDataCollection = () => {
  void (async () => {
    try {
      const districts = await Air4ThaiService.getBangkokDistrictAQI();
      checkDayChanged();
      addDataToArray(districts);
    } catch (error) {
      console.error('[clean-air] Failed to collect Air4Thai snapshot', error);
    }
  })();
};

const checkDayChanged = () => {
  const nowKey = getBangkokDateKey();
  if (nowKey === activeDateKey) return;

  const finishedKey = activeDateKey;
  const snapshot = cloneAggregates();
  resetAggregates();
  activeDateKey = nowKey;

  void saveDailyAverages(finishedKey, snapshot);
};

function getBangkokDateKey(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BANGKOK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

function getBangkokDayEndIso(dateKey: string) {
  return new Date(`${dateKey}T23:59:59+07:00`).toISOString();
}

const isSameBangkokDate = (iso: string, dateKey: string) =>
  getBangkokDateKey(new Date(iso)) === dateKey;

const roundTo = (value: number, precision: number) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const saveDailyAverages = async (
  dateKey: string,
  snapshot: DistricAddDataToArray
) => {
  if (snapshot.size === 0) {
    return;
  }

  const measuredAt = getBangkokDayEndIso(dateKey);

  for (const district of AIR4THAI_DISTRICT_NAMES) {
    const stats = snapshot.get(district);
    const hasSamples = Boolean(stats && stats.count > 0);
    const fallback = latestSnapshot.get(district);
    const fallbackSameDay = Boolean(
      fallback && isSameBangkokDate(fallback.measured_at, dateKey)
    );

    if (!hasSamples && !fallbackSameDay) {
      console.warn(
        `[clean-air] Skipping Air4Thai average for ${district} on ${dateKey} - no samples`
      );
      continue;
    }

    const pm25Average = hasSamples
      ? stats!.sumPm25 / stats!.count
      : fallback!.pm25;
    const aqiAverage = hasSamples
      ? stats!.sumAqi / stats!.count
      : fallback!.aqi;

    try {
      const locationId = await ensureBangkokDistrictAddress(district);
      if (await hasAirQualityRecord({ locationId, measuredAt })) continue;
      await createAirQualityRecord({
        locationId,
        pm25: roundTo(pm25Average, 3),
        aqi: roundTo(aqiAverage, 2),
        category: hasSamples ? resolveCategory(aqiAverage) : fallback!.category,
        measuredAt,
      });
    } catch (error) {
      console.error(
        `[clean-air] Failed to persist Air4Thai average for ${district} on ${dateKey}`,
        error
      );
    }
  }
};

const checkPoorAirQuality = () => {
  if (latestSnapshot.size === 0) return;

  const flagged: Air4ThaiDistrictAirQuality[] = [];

  latestSnapshot.forEach((record) => {
    if (!POOR_AIR_QUALITY_CATEGORIES.has(record.category)) {
      lastAlertedMeasurements.delete(record.district);
      return;
    }

    if (lastAlertedMeasurements.get(record.district) !== record.measured_at) {
      flagged.push(record);
    }
  });

  flagged.forEach((record) => {
    lastAlertedMeasurements.set(record.district, record.measured_at);

    void handleVolunteerAlert(record);
    void handleCitizenAndEmergency(record);
  });
};

const handleVolunteerAlert = async (record: Air4ThaiDistrictAirQuality) => {
  try {
    const eventTitle = `The ${record.district} Clean Air Fair`;

    const alreadyCreated = await CleanAirModel.hasVolunteerEventRecently(
      eventTitle,
      30
    );
    if (alreadyCreated) {
      console.log(
        `[clean-air][volunteer] Event already exists within 30 days: "${eventTitle}"`
      );
      return;
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 7);
    startDate.setHours(9, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 4);

    const registrationDeadline = new Date(startDate);
    registrationDeadline.setDate(startDate.getDate() - 1);
    registrationDeadline.setHours(23, 59, 59, 0);

    const eventData = {
      title: eventTitle,
      description: AIR_CAMPAIGN_DESCRIPTION,
      start_at: startDate.toISOString(),
      end_at: endDate.toISOString(),
      registration_deadline: registrationDeadline.toISOString(),
      image_url:
        'https://res.cloudinary.com/dcpgrfpaf/image/upload/v1733988154/Untitled_design_mfbbac.png',
      total_seats: 50,
      created_by_user_id: 1,
    };

    await EventService.create(eventData);
    console.log(`[clean-air][volunteer] Created event: "${eventTitle}"`);
  } catch (error) {
    console.error(
      `[clean-air][volunteer] Failed to create event for ${record.district}`,
      error
    );
  }
};

const handleCitizenAndEmergency = async (
  record: Air4ThaiDistrictAirQuality
) => {
  try {
    const alreadySentToday = await CleanAirModel.hasAlertSentToday(
      record.district
    );
    if (alreadySentToday) {
      console.log(
        `[clean-air][citizen+emergency] Already sent today for ${record.district}`
      );
      return;
    }

    const users = await addressService.getUsersByDistrict(record.district);
    const userIds = users.map((u) => u.id).filter((id) => Number.isFinite(id));

    if (!userIds.length) {
      return;
    }

    const payload = {
      notification: {
        title: `Air quality alert: ${record.district}`,
        body: `AQI ${record.aqi} (${record.category}). Stay safe and reduce exposure.`,
      },
    };

    const allTokens = await FcmModel.getAllFcmToken();
    const userTokens = allTokens.filter(
      (t) => t.user_id && userIds.includes(t.user_id)
    );

    for (const tokenRecord of userTokens) {
      if (tokenRecord.tokens) {
        try {
          await FcmService.sendNotificationToToken(tokenRecord.tokens, payload);
        } catch (err) {
          console.error(
            `[clean-air] Failed to send notification to token`,
            err
          );
        }
      }
    }

    await CleanAirModel.createAirQualityAlerts(
      record.district,
      record.aqi,
      record.category,
      userIds
    );

    console.log(
      `[clean-air][citizen+emergency] Sent alert for ${record.district}`
    );
  } catch (error) {
    console.error(
      `[clean-air][citizen+emergency] Failed for ${record.district}`,
      error
    );
  }
};

const startSamplingJob = () => {
  if (sampleJob) {
    return;
  }
  const cronExpression = '0 * * * *';
  sampleJob = schedule(
    cronExpression,
    () => {
      runDataCollection();
    },
    {
      timezone: BANGKOK_TIMEZONE,
    }
  );
};

const startFlushJob = () => {
  if (flushJob) {
    return;
  }
  const cronExpression = '*/5 * * * *';
  flushJob = schedule(
    cronExpression,
    () => {
      checkDayChanged();
      checkPoorAirQuality();
    },
    {
      timezone: BANGKOK_TIMEZONE,
    }
  );
};

export const startAir4ThaiAggregationJob = () => {
  if (schedulerStarted || isSchedulerDisabled) {
    return;
  }

  schedulerStarted = true;
  runDataCollection();
  startSamplingJob();
  startFlushJob();
};
