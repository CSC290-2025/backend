import type { Context } from 'hono';
import * as WeatherService from '../services/weather.service';
import { WeatherSchemas } from '../schemas';
import { successResponse } from '@/utils/response';

const listWeather = async (c: Context) => {
  const data = await WeatherService.listWeather();
  return successResponse(c, { data });
};

const getWeather = async (c: Context) => {
  const { id } = WeatherSchemas.WeatherIdParam.parse(c.req.param());
  const weather = await WeatherService.getWeatherById(id);
  return successResponse(c, { weather });
};

const getWeatherByLocation = async (c: Context) => {
  const { locationId } = c.req.param();
  const data = await WeatherService.listWeatherByLocation(locationId);
  return successResponse(c, { data });
};

const createWeather = async (c: Context) => {
  const body = await c.req.json();
  const parsed = WeatherSchemas.CreateWeatherDataSchema.parse(body);
  const weather = await WeatherService.createWeather(parsed);
  return successResponse(
    c,
    { weather },
    201,
    'Weather data created successfully'
  );
};

const updateWeather = async (c: Context) => {
  const { id } = WeatherSchemas.WeatherIdParam.parse(c.req.param());
  const body = await c.req.json();
  const parsed = WeatherSchemas.UpdateWeatherDataSchema.parse(body);
  const weather = await WeatherService.updateWeather(id, parsed);
  return successResponse(
    c,
    { weather },
    200,
    'Weather data updated successfully'
  );
};

const deleteWeather = async (c: Context) => {
  const { id } = WeatherSchemas.WeatherIdParam.parse(c.req.param());
  await WeatherService.deleteWeather(id);
  return successResponse(c, null, 200, 'Weather data deleted successfully');
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
  getWeather,
  getWeatherByLocation,
  createWeather,
  updateWeather,
  deleteWeather,
  deleteAllWeather,
};
