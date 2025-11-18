import type { Context } from 'hono';
import { OpenMeteoService, OpenMeteoScheduler } from '../services';
import { successResponse } from '@/utils/response';
import type { ExternalWeatherQuery, ImportDailyBody } from '../types';

const getOpenMeteoCurrent = async (c: Context) => {
  const data = await OpenMeteoService.getCurrentFromOpenMeteo(
    c.req.query() as unknown as ExternalWeatherQuery
  );
  return successResponse(c, data);
};

const getOpenMeteoHourly = async (c: Context) => {
  const data = await OpenMeteoService.getHourlyFromOpenMeteo(
    c.req.query() as unknown as ExternalWeatherQuery
  );
  return successResponse(c, data);
};

const getOpenMeteoDaily = async (c: Context) => {
  const data = await OpenMeteoService.getDailyFromOpenMeteo(
    c.req.query() as unknown as ExternalWeatherQuery
  );
  return successResponse(c, data);
};

const importDailyOpenMeteo = async (c: Context) => {
  const body = await c.req.json();
  const result = await OpenMeteoScheduler.importYesterdayToDatabase(
    body as ImportDailyBody
  );
  return successResponse(c, result, 201, `Imported daily for ${result.date}`);
};

const importDailyOpenMeteoAll = async (c: Context) => {
  const result = await OpenMeteoScheduler.importAllLocationsYesterday();
  return successResponse(
    c,
    result,
    201,
    `Imported daily for ${result.processed} locations`
  );
};

export {
  getOpenMeteoCurrent,
  getOpenMeteoHourly,
  getOpenMeteoDaily,
  importDailyOpenMeteo,
  importDailyOpenMeteoAll,
};
