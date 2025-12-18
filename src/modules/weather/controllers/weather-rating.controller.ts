import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import { WeatherRatingSchemas } from '../schemas';
import * as WeatherRatingService from '../services/weather-rating.service';
import type { AuthTypes } from '@/modules/Auth/types';

// Authenticated users submit or update their rating for today's Bangkok day token.
const createWeatherRating = async (c: Context) => {
  const payload = WeatherRatingSchemas.WeatherRatingCreateSchema.parse(
    await c.req.json()
  );
  const user = c.get('user') as AuthTypes.JwtPayload | undefined;
  if (!user?.userId) {
    throw new Error('Authenticated user not found in context');
  }

  const data = await WeatherRatingService.createWeatherRating(
    payload,
    user.userId
  );
  return successResponse(c, { data }, 201);
};

// Fetch the signed-in user's rating for the given day/location (null when not rated).
const getUserWeatherRating = async (c: Context) => {
  const query = WeatherRatingSchemas.WeatherRatingUserQuerySchema.parse(
    c.req.query()
  );
  const user = c.get('user') as AuthTypes.JwtPayload | undefined;
  if (!user?.userId) {
    throw new Error('Authenticated user not found in context');
  }

  const data = await WeatherRatingService.getUserWeatherRating(
    query,
    user.userId
  );
  return successResponse(c, { data });
};

// List all weather ratings ordered from newest to oldest.
const listWeatherRatings = async (c: Context) => {
  const data = await WeatherRatingService.listWeatherRatings();
  return successResponse(c, { data });
};

// Return grouped averages filtered by optional Bangkok date and location filters.
const getAverageWeatherRatings = async (c: Context) => {
  const query = WeatherRatingSchemas.WeatherRatingAverageQuerySchema.parse(
    c.req.query()
  );
  const data = await WeatherRatingService.getAverageWeatherRatings(query);
  return successResponse(c, { data });
};

// Delete all ratings on the provided Bangkok date and report the count removed.
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

// Delete every record from weather_rating and return the count removed.
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
  getUserWeatherRating,
  getAverageWeatherRatings,
  deleteWeatherRatingsByDate,
  deleteAllWeatherRatings,
};
