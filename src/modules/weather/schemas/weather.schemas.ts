// schema สำหรับ validate payload/params ของ weather module และใช้ gen OpenAPI
import { z } from 'zod';
import { createGetRoute, createDeleteRoute } from '@/utils/openapi-helpers';

// รูปแบบข้อมูล weather_data ที่ดึงจากฐาน
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

// ใช้กับ path param /weather/{date}
const WeatherDateParam = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
});

// response มาตรฐานของ list endpoints
const WeatherDataListSchema = z.object({
  data: z.array(WeatherDataSchema),
});

// route meta สำหรับ GET /weather
const listWeatherDataRoute = createGetRoute({
  path: '/weather',
  summary: 'List weather data',
  responseSchema: WeatherDataListSchema,
  tags: ['Weather'],
});

// ใช้ validate path param location_id
const WeatherLocationParam = z.object({
  location_id: z
    .string()
    .regex(/^\d+$/, 'location_id must be a positive integer'),
});

// route meta สำหรับ GET /weather/location/{location_id}
const getWeatherByLocationRoute = createGetRoute({
  path: '/weather/location/{location_id}',
  summary: 'List weather data for a specific location id (16-19)',
  params: WeatherLocationParam,
  responseSchema: WeatherDataListSchema,
  tags: ['Weather'],
});

// route meta สำหรับ GET /weather/{date}
const getWeatherDataRoute = createGetRoute({
  path: '/weather/{date}',
  summary: 'Get weather data for a specific date (YYYY-MM-DD)',
  responseSchema: WeatherDataListSchema,
  params: WeatherDateParam,
  tags: ['Weather'],
});

// route meta สำหรับ DELETE /weather/{date}
const deleteWeatherDataRoute = createDeleteRoute({
  path: '/weather/{date}',
  summary: 'Delete weather data for a specific date (YYYY-MM-DD)',
  params: WeatherDateParam,
  tags: ['Weather'],
});

// route meta สำหรับ DELETE /weather
const deleteAllWeatherDataRoute = createDeleteRoute({
  path: '/weather',
  summary: 'Delete all weather data from database',
  params: z.object({}),
  tags: ['Weather'],
});

// schema query สำหรับช่วงวันที่
const WeatherDateRangeQuery = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
});

// route meta สำหรับ GET /weather/range
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
  WeatherLocationParam,
  listWeatherDataRoute,
  getWeatherDataRoute,
  getWeatherByLocationRoute,
  deleteWeatherDataRoute,
  deleteAllWeatherDataRoute,
  listWeatherByRangeRoute,
};
