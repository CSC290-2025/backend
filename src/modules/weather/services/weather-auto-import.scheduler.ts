import { schedule } from 'node-cron';
import { importAllLocationsYesterday } from './weather-open-meteo.scheduler';

const AUTO_IMPORT_CRON = '5 0 * * *';
const BANGKOK_TIMEZONE = 'Asia/Bangkok';

const isAutoImportDisabled =
  process.env.G09_DISABLE_WEATHER_AUTO_IMPORT === 'true' ||
  process.env.NODE_ENV === 'test';

let autoImportEnabled = false;
let isRunning = false;
let lastImportedDateKey: string | null = null;

const getBangkokDateKey = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: BANGKOK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const getBangkokYesterdayKey = () => {
  const bangkokNow = new Date(
    new Date().toLocaleString('en-US', { timeZone: BANGKOK_TIMEZONE })
  );
  bangkokNow.setDate(bangkokNow.getDate() - 1);
  return getBangkokDateKey(bangkokNow);
};

// Runs the Open-Meteo import once and records when/what happened.
const runDailyAutoImport = async () => {
  if (isRunning) {
    return;
  }

  isRunning = true;

  try {
    const targetDateKey = getBangkokYesterdayKey();
    if (lastImportedDateKey === targetDateKey) {
      console.info(
        `[weather][auto-import] Skipping – already processed ${targetDateKey}`
      );
      return;
    }

    const result = await importAllLocationsYesterday();
    lastImportedDateKey = targetDateKey;
    console.info(
      `[weather][auto-import] Imported ${result.processed} location(s)`
    );
  } catch (error) {
    console.error('[weather] Failed to run daily auto import', error);
  } finally {
    isRunning = false;
  }
};

// Creates the cron job if it is not already active.
const enableWeatherAutoImport = () => {
  if (isAutoImportDisabled) {
    console.info('[weather][auto-import] Scheduler disabled via env flag');
    return;
  }

  if (autoImportEnabled) {
    return;
  }

  schedule(
    AUTO_IMPORT_CRON,
    () => {
      void runDailyAutoImport();
    },
    { timezone: BANGKOK_TIMEZONE }
  );

  autoImportEnabled = true;
  console.info(
    `[weather][auto-import] Scheduler started (cron: ${AUTO_IMPORT_CRON}, tz: ${BANGKOK_TIMEZONE})`
  );
};

export { enableWeatherAutoImport };
