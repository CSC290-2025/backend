import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const decimalField = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === 'string' ? Number(v) : v))
  .nullable()
  .optional();

const WeatherDataSchema = z.object({
  id: z.number().int(),
  location_id: z.number().int().nullable().optional(),
  temperature: z.number().nullable(),
  feel_temperature: z.number().nullable(),
  humidity: z.number().nullable(),
  wind_speed: z.number().nullable(),
  wind_direction: z.string().nullable(),
  rainfall_probability: z.number().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

const CreateWeatherDataSchema = z.object({
  location_id: z.number().int().optional().nullable(),
  temperature: decimalField,
  feel_temperature: decimalField,
  humidity: decimalField,
  wind_speed: decimalField,
  wind_direction: z.string().max(50).optional().nullable(),
  rainfall_probability: decimalField,
});

const UpdateWeatherDataSchema = z.object({
  location_id: z.number().int().optional().nullable(),
  temperature: decimalField,
  feel_temperature: decimalField,
  humidity: decimalField,
  wind_speed: decimalField,
  wind_direction: z.string().max(50).optional().nullable(),
  rainfall_probability: decimalField,
});

const WeatherIdParam = z.object({
  id: z.string(),
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
  path: '/weather/{id}',
  summary: 'Get weather data by ID',
  responseSchema: WeatherDataSchema,
  params: WeatherIdParam,
  tags: ['Weather'],
});

const createWeatherDataRoute = createPostRoute({
  path: '/weather',
  summary: 'Create weather data',
  requestSchema: CreateWeatherDataSchema,
  responseSchema: WeatherDataSchema,
  tags: ['Weather'],
});

const updateWeatherDataRoute = createPutRoute({
  path: '/weather/{id}',
  summary: 'Update weather data',
  params: WeatherIdParam,
  requestSchema: UpdateWeatherDataSchema,
  responseSchema: WeatherDataSchema,
  tags: ['Weather'],
});

const deleteWeatherDataRoute = createDeleteRoute({
  path: '/weather/{id}',
  summary: 'Delete weather data',
  params: WeatherIdParam,
  tags: ['Weather'],
});

export const WeatherSchemas = {
  WeatherDataSchema,
  CreateWeatherDataSchema,
  UpdateWeatherDataSchema,
  WeatherDataListSchema,
  WeatherIdParam,
  listWeatherDataRoute,
  getWeatherDataRoute,
  createWeatherDataRoute,
  updateWeatherDataRoute,
  deleteWeatherDataRoute,
};
