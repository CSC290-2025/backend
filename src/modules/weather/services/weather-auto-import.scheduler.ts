import { schedule, type ScheduledTask } from 'node-cron';
import { importAllLocationsYesterday } from './weather-open-meteo.scheduler';

const AUTO_IMPORT_CRON = '5 0 * * *';
const BANGKOK_TIMEZONE = 'Asia/Bangkok';

type LastResult = {
  success: boolean;
  message?: string;
};

let autoImportEnabled = false;
let autoImportJob: ScheduledTask | null = null;
let isRunning = false;
let lastRunAt: string | null = null;
let lastResult: LastResult | null = null;

// Runs the Open-Meteo import once and records when/what happened.
const runDailyAutoImport = async () => {
  if (isRunning) {
    return;
  }

  isRunning = true;
  lastRunAt = new Date().toISOString();

  try {
    const result = await importAllLocationsYesterday();
    lastResult = {
      success: true,
      message: `Processed ${result.processed} location(s)`,
    };
  } catch (error) {
    lastResult = {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error while importing weather data',
    };
    console.error('[weather] Failed to run daily auto import', error);
  } finally {
    isRunning = false;
  }
};

// Returns a snapshot of the current scheduler state for the API.
const getWeatherAutoImportStatus = () => ({
  enabled: autoImportEnabled,
  cron: AUTO_IMPORT_CRON,
  timezone: BANGKOK_TIMEZONE,
  lastRunAt,
  lastResult,
  running: isRunning,
});

// Creates the cron job if it is not already active.
const enableWeatherAutoImport = () => {
  if (autoImportEnabled) {
    return getWeatherAutoImportStatus();
  }

  autoImportJob = schedule(
    AUTO_IMPORT_CRON,
    () => {
      void runDailyAutoImport();
    },
    { timezone: BANGKOK_TIMEZONE }
  );

  autoImportEnabled = true;
  return getWeatherAutoImportStatus();
};

// Stops the cron job and clears the in-memory handle.
const disableWeatherAutoImport = () => {
  if (autoImportJob) {
    autoImportJob.stop();
    autoImportJob = null;
  }
  autoImportEnabled = false;
  return getWeatherAutoImportStatus();
};

export {
  enableWeatherAutoImport,
  disableWeatherAutoImport,
  getWeatherAutoImportStatus,
};
