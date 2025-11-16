import { schedule, type ScheduledTask } from 'node-cron';
import { CleanAirModel } from '../models';
import type { Air4ThaiDistrictAirQuality } from '../types';
import {
  Air4ThaiService,
  AIR4THAI_DISTRICT_NAMES,
  resolveCategory,
} from './clean-air-air4thai.service';

type DistrictAggregate = {
  sumPm25: number;
  sumAqi: number;
  count: number;
};

type DistricAddDataToArray = Map<string, DistrictAggregate>;

const { ensureBangkokDistrictAddress, createAirQualityRecord } = CleanAirModel;

const BANGKOK_TIMEZONE = 'Asia/Bangkok';
const aggregates = new Map<string, DistrictAggregate>();
const latestSnapshot = new Map<string, Air4ThaiDistrictAirQuality>();

let activeDateKey = getBangkokDateKey();
let schedulerStarted = false;
let sampleJob: ScheduledTask | null = null;
let flushJob: ScheduledTask | null = null;

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
  return formatter.format(date); // YYYY-MM-DD
}

function getBangkokDayEndIso(dateKey: string) {
  return new Date(`${dateKey}T23:59:59+07:00`).toISOString();
}

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

    if (!hasSamples && !fallback) {
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
