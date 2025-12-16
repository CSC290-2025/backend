import type { Context } from 'hono';
import * as WeatherService from '../services/weather.service';
import { WeatherSchemas } from '../schemas';
import { successResponse } from '@/utils/response';

// Return every weather record ordered from most recent to oldest.
const listWeather = async (c: Context) => {
  const data = await WeatherService.listWeather();
  return successResponse(c, { data });
};

// Return every weather record created on the provided YYYY-MM-DD date.
const getWeatherByDate = async (c: Context) => {
  const { date } = WeatherSchemas.WeatherDateParam.parse(c.req.param());
  const data = await WeatherService.getWeatherByDate(date);
  return successResponse(c, { data });
};

// Return weather records between the `from` and `to` query bounds (inclusive).
const listWeatherByDateRange = async (c: Context) => {
  const { from, to } = WeatherSchemas.WeatherDateRangeQuery.parse(
    c.req.query()
  );
  const data = await WeatherService.listWeatherByDateRange(from, to);
  return successResponse(c, { data });
};

// Return weather records for the specified location path parameter.
const getWeatherByLocation = async (c: Context) => {
  const { location_id } = WeatherSchemas.WeatherLocationParam.parse(
    c.req.param()
  );
  const data = await WeatherService.listWeatherByLocation(location_id);
  return successResponse(c, { data });
};

// Delete all weather records on the provided date and report the count removed.
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

// Clear the entire weather_data table and report the number of rows deleted.
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
