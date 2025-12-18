import { z } from 'zod';
import {
  createDeleteRoute,
  createGetRoute,
  createPostRoute,
} from '@/utils/openapi-helpers';
import { authMiddleware } from '@/middlewares';

const RatingTag = ['Weather Ratings'] as const;
const DateRegex = /^\d{4}-\d{2}-\d{2}$/;

// DTO returned to clients for a single weather rating row.
const WeatherRatingSchema = z.object({
  id: z.number().int(),
  location_id: z.number().int().nullable(),
  date: z.string().regex(DateRegex, 'YYYY-MM-DD'),
  rating: z.number().min(1).max(5),
  district: z.string().nullable().optional(),
});

// Request body schema for submitting a rating.
const WeatherRatingCreateSchema = z.object({
  location_id: z.coerce.number().int().positive(),
  rating: z.number().min(1).max(5),
});

// Optional filters when computing averages.
const WeatherRatingAverageQuerySchema = z.object({
  date: z.string().regex(DateRegex, 'YYYY-MM-DD').optional(),
  location_id: z.coerce.number().int().positive().optional(),
});

// Query parameters to fetch the signed-in user's rating.
const WeatherRatingUserQuerySchema = z.object({
  location_id: z.coerce.number().int().positive(),
  date: z.string().regex(DateRegex, 'YYYY-MM-DD').optional(),
});

const WeatherRatingAverageItemSchema = z.object({
  date: z.string().regex(DateRegex, 'YYYY-MM-DD').nullable(),
  location_id: z.number().int().nullable(),
  district: z.string().nullable(),
  average_rating: z.number().nullable(),
  rating_count: z.number().int(),
});

const WeatherRatingAverageListSchema = z.object({
  data: z.array(WeatherRatingAverageItemSchema),
});

const WeatherRatingListSchema = z.object({
  data: z.array(WeatherRatingSchema),
});

const WeatherRatingDateParam = z.object({
  date: z.string().regex(DateRegex, 'YYYY-MM-DD'),
});

const createWeatherRatingRoute = createPostRoute({
  path: '/weather/ratings',
  summary: 'Submit a daily weather rating for a Bangkok district',
  requestSchema: WeatherRatingCreateSchema,
  responseSchema: WeatherRatingSchema,
  tags: [...RatingTag],
  middleware: [authMiddleware],
});

const listWeatherRatingsRoute = createGetRoute({
  path: '/weather/ratings',
  summary: 'List all weather rating entries (newest first)',
  responseSchema: WeatherRatingListSchema,
  tags: [...RatingTag],
});

const getAverageWeatherRatingsRoute = createGetRoute({
  path: '/weather/ratings/average',
  summary:
    'Get average weather ratings by Bangkok date/district (YYYY-MM-DD, Asia/Bangkok)',
  query: WeatherRatingAverageQuerySchema,
  responseSchema: WeatherRatingAverageListSchema,
  tags: [...RatingTag],
});

const getUserWeatherRatingRoute = createGetRoute({
  path: '/weather/ratings/me',
  summary: 'Get the signed-in user rating for a Bangkok day/location',
  query: WeatherRatingUserQuerySchema,
  responseSchema: WeatherRatingSchema.nullable(),
  tags: [...RatingTag],
  middleware: [authMiddleware],
});

const deleteWeatherRatingsByDateRoute = createDeleteRoute({
  path: '/weather/ratings/date/{date}',
  summary: 'Delete weather ratings by Bangkok date (YYYY-MM-DD, Asia/Bangkok)',
  params: WeatherRatingDateParam,
  tags: [...RatingTag],
});

const deleteAllWeatherRatingsRoute = createDeleteRoute({
  path: '/weather/ratings',
  summary: 'Delete every weather rating (irreversible)',
  params: z.object({}),
  tags: [...RatingTag],
});

export const WeatherRatingSchemas = {
  WeatherRatingSchema,
  WeatherRatingCreateSchema,
  WeatherRatingAverageQuerySchema,
  WeatherRatingAverageItemSchema,
  WeatherRatingAverageListSchema,
  WeatherRatingUserQuerySchema,
  WeatherRatingListSchema,
  WeatherRatingDateParam,
  listWeatherRatingsRoute,
  getUserWeatherRatingRoute,
  createWeatherRatingRoute,
  getAverageWeatherRatingsRoute,
  deleteWeatherRatingsByDateRoute,
  deleteAllWeatherRatingsRoute,
};
