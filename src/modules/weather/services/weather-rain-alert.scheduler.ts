import { schedule, type ScheduledTask } from 'node-cron';
import { bangkokDistricts } from '../utils';
import { getRainDailyWindow } from './weather-open-meteo.service';
import { FcmService } from '@/modules/emergency/services';

const BANGKOK_TIMEZONE = 'Asia/Bangkok';
const RAIN_ALERT_CRON = '0 7 */3 * *';
const DAYS_TO_CHECK = 4; // today + next 3 days
const MIN_CONSECUTIVE_RAIN_DAYS = 3;
const MIN_RAIN_MM = 1;
const MIN_PROBABILITY = 60;
const RISKY_CONDITIONS = new Set(['Rain', 'Snow', 'Thunderstorm']);

let rainAlertJob: ScheduledTask | null = null;
let rainAlertRunning = false;
let lastRunAt: string | null = null;
const lastAlertKeyByDistrict = new Map<number, string>();

const isSchedulerDisabled =
  process.env.G09_DISABLE_RAIN_ALERT_SCHEDULER === 'true' ||
  process.env.NODE_ENV === 'test';

// Convert current date to YYYY-MM-DD in Bangkok time for API queries.
const formatBangkokDate = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BANGKOK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
};

type RainDailyResponse = Awaited<ReturnType<typeof getRainDailyWindow>>;
type RainDay = RainDailyResponse['days'][number];

type RainStreak = {
  startIndex: number;
  endIndex: number;
  length: number;
};

// Treat the day as risky when rain volume or probability crosses thresholds.
const isRainyDay = (day: RainDay) => {
  const rainAmount = day.rain_sum ?? day.precipitation_sum ?? 0;
  const probability = day.precipitation_probability_max ?? 0;

  return (
    rainAmount >= MIN_RAIN_MM ||
    probability >= MIN_PROBABILITY ||
    RISKY_CONDITIONS.has(day.condition)
  );
};

// Scan the forecast window to find the first streak of consecutive rainy days.
const findRainStreak = (days: RainDay[]): RainStreak | null => {
  let streak: RainStreak | null = null;
  let count = 0;
  let startIndex = 0;

  for (let i = 0; i < Math.min(days.length, DAYS_TO_CHECK); i += 1) {
    if (isRainyDay(days[i])) {
      if (count === 0) {
        startIndex = i;
      }
      count += 1;
      if (count >= MIN_CONSECUTIVE_RAIN_DAYS) {
        streak = { startIndex, endIndex: i, length: count };
        break;
      }
    } else {
      count = 0;
    }
  }

  return streak;
};

// Produce the notification text that will be broadcast citywide.
const buildAlertMessage = (
  district: string,
  days: RainDay[],
  streak: RainStreak
) => {
  const startDate = days[streak.startIndex].date;
  const endDate = days[streak.endIndex].date;
  return {
    title: `Flood risk alert: ${district}`,
    body: `Our rainfall analysis indicates potential flooding between ${startDate} and ${endDate}. Please monitor city updates and plan routes with caution.`,
  };
};

// Send the alert via the Emergency module unless we already warned for this window.
const dispatchCitywideAlert = async (
  districtId: number,
  messageKey: string,
  notification: { title: string; body: string }
) => {
  if (lastAlertKeyByDistrict.get(districtId) === messageKey) {
    return;
  }

  try {
    await FcmService.sendAllNotificationService({ notification });
    lastAlertKeyByDistrict.set(districtId, messageKey);
    console.info('[weather][rain-alert] Broadcasted alert:', notification);
  } catch (error) {
    console.error('[weather][rain-alert] Failed to send broadcast', error);
  }
};

// Pull the rain window for the district and trigger an alert when a streak exists.
const evaluateDistrict = async (locationId: number) => {
  const today = formatBangkokDate();
  const rainWindow = await getRainDailyWindow({
    location_id: locationId,
    date: today,
    days_ahead: DAYS_TO_CHECK - 1,
  });

  const streak = findRainStreak(rainWindow.days);
  if (!streak) {
    return;
  }

  const messageKey = `${rainWindow.location.city}:${rainWindow.range.start}`;
  const notification = buildAlertMessage(
    rainWindow.location.city,
    rainWindow.days,
    streak
  );
  await dispatchCitywideAlert(locationId, messageKey, notification);
};

// Iterate over every district (once per cron) while preventing overlapping runs.
const runRainAlertEvaluation = async () => {
  if (rainAlertRunning) {
    return;
  }
  rainAlertRunning = true;

  try {
    await Promise.all(
      bangkokDistricts.map((district) =>
        evaluateDistrict(district.location_id).catch((error) => {
          console.error(
            `[weather][rain-alert] Failed to check district ${district.name}`,
            error
          );
        })
      )
    );
    lastRunAt = new Date().toISOString();
  } finally {
    rainAlertRunning = false;
  }
};

// Kick off the cron-based monitor and run an immediate pass on startup.
const startConsecutiveRainAlertJob = () => {
  if (isSchedulerDisabled) {
    console.info('[weather][rain-alert] Scheduler disabled via env flag');
    return;
  }
  if (rainAlertJob) {
    return;
  }

  rainAlertJob = schedule(
    RAIN_ALERT_CRON,
    () => {
      void runRainAlertEvaluation();
    },
    { timezone: BANGKOK_TIMEZONE }
  );

  console.info(
    `[weather][rain-alert] Scheduler started (cron: ${RAIN_ALERT_CRON}, tz: ${BANGKOK_TIMEZONE})`
  );
  void runRainAlertEvaluation();
};

// Allow callers/tests to stop the cron job explicitly.
const stopConsecutiveRainAlertJob = () => {
  if (rainAlertJob) {
    rainAlertJob.stop();
    rainAlertJob = null;
  }
};

// Expose the scheduler status for diagnostics or future routes.
const getConsecutiveRainAlertStatus = () => ({
  enabled: Boolean(rainAlertJob),
  running: rainAlertRunning,
  cron: RAIN_ALERT_CRON,
  timezone: BANGKOK_TIMEZONE,
  lastRunAt,
});

export {
  startConsecutiveRainAlertJob,
  stopConsecutiveRainAlertJob,
  getConsecutiveRainAlertStatus,
};
