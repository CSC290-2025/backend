import type { Context } from 'hono';
import * as WeatherService from '../services/weather.service';
import { WeatherSchemas } from '../schemas';
import { successResponse } from '@/utils/response';

const listWeather = async (c: Context) => {
  const data = await WeatherService.listWeather();
  return successResponse(c, { data });
};

const getWeatherByDate = async (c: Context) => {
  const { date } = WeatherSchemas.WeatherDateParam.parse(c.req.param());
  const data = await WeatherService.getWeatherByDate(date);
  return successResponse(c, { data });
};

const listWeatherByDateRange = async (c: Context) => {
  const { from, to } = WeatherSchemas.WeatherDateRangeQuery.parse(
    c.req.query()
  );
  const data = await WeatherService.listWeatherByDateRange(from, to);
  return successResponse(c, { data });
};

const getWeatherByLocation = async (c: Context) => {
  const { locationId } = c.req.param();
  const data = await WeatherService.listWeatherByLocation(locationId);
  return successResponse(c, { data });
};

const deleteWeatherByDate = async (c: Context) => {
  const { date } = WeatherSchemas.WeatherDateParam.parse(c.req.param());
  const result = await WeatherService.deleteWeatherByDate(date);
  return successResponse(
    c,
    result,
    200,
    `Deleted ${result.deleted} weather records for ${date}`
  );
};

const deleteAllWeather = async (c: Context) => {
  const result = await WeatherService.deleteAllWeather();
  return successResponse(
    c,
    result,
    200,
    `Deleted ${result.deleted} weather records`
  );
};

export {
  listWeather,
  getWeatherByDate,
  listWeatherByDateRange,
  getWeatherByLocation,
  deleteWeatherByDate,
  deleteAllWeather,
};
