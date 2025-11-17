import type { Context } from 'hono';
import { OpenMeteoService, OpenMeteoScheduler } from '../services';
import { successResponse } from '@/utils/response';
import type { ExternalWeatherQuery, ImportDailyBody } from '../types';

const getOpenMeteoWeather = async (c: Context) => {
  const data = await OpenMeteoService.getWeatherFromOpenMeteo(
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

export { getOpenMeteoWeather, importDailyOpenMeteo };
