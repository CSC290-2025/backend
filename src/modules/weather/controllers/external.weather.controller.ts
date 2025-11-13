import type { Context } from 'hono';
import { ExternalWeatherService } from '../services';
import { successResponse } from '@/utils/response';

const getExternalWeather = async (c: Context) => {
  const data = await ExternalWeatherService.getExternalWeather(c.req.query());
  return successResponse(c, data);
};

const importDaily = async (c: Context) => {
  const body = await c.req.json();
  const result = await ExternalWeatherService.importDaily(body);
  return successResponse(c, result, 201, `Imported daily for ${result.date}`);
};

export { getExternalWeather, importDaily };
