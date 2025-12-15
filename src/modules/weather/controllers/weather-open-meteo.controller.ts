import type { Context } from 'hono';
import { OpenMeteoService, OpenMeteoScheduler } from '../services';
import { successResponse } from '@/utils/response';
import type {
  ExternalWeatherQuery,
  ImportDailyBody,
  RainDailyQuery,
  RainHourlyQuery,
} from '../types';
import {
  enableWeatherAutoImport,
  disableWeatherAutoImport,
  getWeatherAutoImportStatus as getWeatherAutoImportStatusState,
} from '../services/weather-auto-import.scheduler';

// Forward the `/current` endpoint to Open-Meteo and relay the structured DTO.
const getOpenMeteoCurrent = async (c: Context) => {
  const data = await OpenMeteoService.getCurrentFromOpenMeteo(
    c.req.query() as unknown as ExternalWeatherQuery
  );
  return successResponse(c, data);
};

// Retrieve hourly forecast data for the requested district.
const getOpenMeteoHourly = async (c: Context) => {
  const data = await OpenMeteoService.getHourlyFromOpenMeteo(
    c.req.query() as unknown as ExternalWeatherQuery
  );
  return successResponse(c, data);
};

// Retrieve daily forecast data for the requested district.
const getOpenMeteoDaily = async (c: Context) => {
  const data = await OpenMeteoService.getDailyFromOpenMeteo(
    c.req.query() as unknown as ExternalWeatherQuery
  );
  return successResponse(c, data);
};

// Retrieve rain-focused daily metrics for the selected date window.
const getOpenMeteoRainDaily = async (c: Context) => {
  const data = await OpenMeteoService.getRainDailyWindow(
    c.req.query() as unknown as RainDailyQuery
  );
  return successResponse(c, data);
};

// Retrieve rain-focused hourly metrics for a single day.
const getOpenMeteoRainHourly = async (c: Context) => {
  const data = await OpenMeteoService.getRainHourlyByDate(
    c.req.query() as unknown as RainHourlyQuery
  );
  return successResponse(c, data);
};

// Import yesterday's aggregates for a single district and persist them.
const importDailyOpenMeteo = async (c: Context) => {
  const body = await c.req.json();
  const result = await OpenMeteoScheduler.importYesterdayToDatabase(
    body as ImportDailyBody
  );
  return successResponse(c, result, 201, `Imported daily for ${result.date}`);
};

// Import yesterday's aggregates for every configured district.
const importDailyOpenMeteoAll = async (c: Context) => {
  const result = await OpenMeteoScheduler.importAllLocationsYesterday();
  return successResponse(
    c,
    result,
    201,
    `Imported daily for ${result.processed} locations`
  );
};

const startWeatherAutoImport = async (c: Context) => {
  const status = enableWeatherAutoImport();
  return successResponse(
    c,
    { data: status },
    200,
    'Daily auto-import enabled (runs at 00:05 Asia/Bangkok)'
  );
};

const stopWeatherAutoImport = async (c: Context) => {
  const status = disableWeatherAutoImport();
  return successResponse(
    c,
    { data: status },
    200,
    'Daily auto-import disabled'
  );
};

const getWeatherAutoImportStatus = async (c: Context) => {
  const status = getWeatherAutoImportStatusState();
  return successResponse(c, { data: status });
};

export {
  getOpenMeteoCurrent,
  getOpenMeteoHourly,
  getOpenMeteoDaily,
  getOpenMeteoRainDaily,
  getOpenMeteoRainHourly,
  importDailyOpenMeteo,
  importDailyOpenMeteoAll,
  startWeatherAutoImport,
  stopWeatherAutoImport,
  getWeatherAutoImportStatus,
};
