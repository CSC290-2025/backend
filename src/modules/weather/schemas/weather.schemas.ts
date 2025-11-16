import { z } from 'zod';
import { createGetRoute, createDeleteRoute } from '@/utils/openapi-helpers';

const decimalField = z.coerce.number().nullable().optional();

const WeatherDataSchema = z.object({
  id: z.number().int(),
  location_id: z.number().int().nullable(),
  temperature: z.number().nullable(),
  feel_temperature: z.number().nullable(),
  humidity: z.number().nullable(),
  wind_speed: z.number().nullable(),
  wind_direction: z.string().nullable(),
  rainfall_probability: z.number().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  addresses: z.any().nullable().optional(),
});

const WeatherDateParam = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
});

const WeatherDataListSchema = z.object({
  data: z.array(WeatherDataSchema),
});

const listWeatherDataRoute = createGetRoute({
  path: '/weather',
  summary: 'List weather data',
  responseSchema: WeatherDataListSchema,
  tags: ['Weather'],
});

const getWeatherDataRoute = createGetRoute({
  path: '/weather/{date}',
  summary: 'Get weather data for a specific date (YYYY-MM-DD)',
  responseSchema: WeatherDataListSchema,
  params: WeatherDateParam,
  tags: ['Weather'],
});

const deleteWeatherDataRoute = createDeleteRoute({
  path: '/weather/{date}',
  summary: 'Delete weather data for a specific date (YYYY-MM-DD)',
  params: WeatherDateParam,
  tags: ['Weather'],
});

const deleteAllWeatherDataRoute = createDeleteRoute({
  path: '/weather',
  summary: 'Delete all weather data from database',
  params: z.object({}),
  tags: ['Weather'],
});

// Date range query schema and route
const WeatherDateRangeQuery = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
});

const listWeatherByRangeRoute = createGetRoute({
  path: '/weather/range',
  summary:
    'List weather data between two dates (inclusive), query params `from` and `to` in YYYY-MM-DD',
  query: WeatherDateRangeQuery,
  responseSchema: WeatherDataListSchema,
  tags: ['Weather'],
});

export const WeatherSchemas = {
  WeatherDataSchema,
  WeatherDataListSchema,
  WeatherDateParam,
  WeatherDateRangeQuery,
  listWeatherDataRoute,
  getWeatherDataRoute,
  deleteWeatherDataRoute,
  deleteAllWeatherDataRoute,
  listWeatherByRangeRoute,
};
