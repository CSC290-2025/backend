// Schemas for validating weather module payloads/params and generating OpenAPI.
import { z } from 'zod';
import { createGetRoute, createDeleteRoute } from '@/utils/openapi-helpers';

// weather_data row shape returned from the database.
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

// Path parameter schema for /weather/date/{date}.
const WeatherDateParam = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
});

// Standard response envelope for list endpoints.
const WeatherDataListSchema = z.object({
  data: z.array(WeatherDataSchema),
});

// Route meta for GET /weather.
const listWeatherDataRoute = createGetRoute({
  path: '/weather',
  summary: 'List all stored weather data (newest first)',
  responseSchema: WeatherDataListSchema,
  tags: ['Weather'],
});

// Path parameter schema for location_id values.
const WeatherLocationParam = z.object({
  location_id: z.coerce.number().int().positive(),
});

// Route meta for GET /weather/location/{location_id}.
const getWeatherByLocationRoute = createGetRoute({
  path: '/weather/location/{location_id}',
  summary: 'List weather data for one location_id (Bangkok district)',
  params: WeatherLocationParam,
  responseSchema: WeatherDataListSchema,
  tags: ['Weather'],
});

// Route meta for GET /weather/date/{date}.
const getWeatherDataRoute = createGetRoute({
  path: '/weather/date/{date}',
  summary: 'Get weather data for a Bangkok date (YYYY-MM-DD, Asia/Bangkok)',
  responseSchema: WeatherDataListSchema,
  params: WeatherDateParam,
  tags: ['Weather'],
});

// Route meta for DELETE /weather/date/{date}.
const deleteWeatherDataRoute = createDeleteRoute({
  path: '/weather/date/{date}',
  summary: 'Delete weather data for a Bangkok date (YYYY-MM-DD, Asia/Bangkok)',
  params: WeatherDateParam,
  tags: ['Weather'],
});

// Route meta for DELETE /weather.
const deleteAllWeatherDataRoute = createDeleteRoute({
  path: '/weather',
  summary: 'Delete every weather data record (irreversible)',
  params: z.object({}),
  tags: ['Weather'],
});

// Query schema for date-range filtering.
const WeatherDateRangeQuery = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
});

// Route meta for GET /weather/range.
const listWeatherByRangeRoute = createGetRoute({
  path: '/weather/range',
  summary:
    'List weather data between two Bangkok dates (inclusive, YYYY-MM-DD, Asia/Bangkok)',
  query: WeatherDateRangeQuery,
  responseSchema: WeatherDataListSchema,
  tags: ['Weather'],
});

export const WeatherSchemas = {
  WeatherDataSchema,
  WeatherDataListSchema,
  WeatherDateParam,
  WeatherDateRangeQuery,
  WeatherLocationParam,
  listWeatherDataRoute,
  getWeatherDataRoute,
  getWeatherByLocationRoute,
  deleteWeatherDataRoute,
  deleteAllWeatherDataRoute,
  listWeatherByRangeRoute,
};
