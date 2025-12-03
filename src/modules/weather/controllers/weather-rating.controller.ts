import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { WeatherRatingSchemas } from '../schemas';
import * as WeatherRatingService from '../services/weather-rating.service';

// Create a new weather rating for the given payload and emit the saved record.
const createWeatherRating = async (c: Context) => {
  const payload = WeatherRatingSchemas.WeatherRatingCreateSchema.parse(
    await c.req.json()
  );
  const data = await WeatherRatingService.createWeatherRating(payload);
  return successResponse(c, { data }, 201);
};

// List every stored weather rating ordered from newest to oldest.
const listWeatherRatings = async (c: Context) => {
  const data = await WeatherRatingService.listWeatherRatings();
  return successResponse(c, { data });
};

// Return grouped averages filtered by the validated Bangkok-date query parameters.
const getAverageWeatherRatings = async (c: Context) => {
  const query = WeatherRatingSchemas.WeatherRatingAverageQuerySchema.parse(
    c.req.query()
  );
  const data = await WeatherRatingService.getAverageWeatherRatings(query);
  return successResponse(c, { data });
};

// Delete all ratings on the provided Bangkok date and report the number removed.
const deleteWeatherRatingsByDate = async (c: Context) => {
  const { date } = WeatherRatingSchemas.WeatherRatingDateParam.parse(
    c.req.param()
  );
  const result = await WeatherRatingService.deleteWeatherRatingsByDate(date);
  return successResponse(
    c,
    result,
    200,
    `Deleted ${result.deleted} weather ratings for ${date}`
  );
};

// Delete every record from the weather_rating table and return the count.
const deleteAllWeatherRatings = async (c: Context) => {
  const result = await WeatherRatingService.deleteAllWeatherRatings();
  return successResponse(
    c,
    result,
    200,
    `Deleted ${result.deleted} weather ratings`
  );
};

export {
  listWeatherRatings,
  createWeatherRating,
  getAverageWeatherRatings,
  deleteWeatherRatingsByDate,
  deleteAllWeatherRatings,
};
