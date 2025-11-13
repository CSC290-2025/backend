import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

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

const CreateWeatherDataSchema = z.object({
  location_id: z.number().int(),
  temperature: decimalField,
  feel_temperature: decimalField,
  humidity: decimalField,
  wind_speed: decimalField,
  wind_direction: z.string().max(50).nullable().optional(),
  rainfall_probability: decimalField,
});

const UpdateWeatherDataSchema = z.object({
  location_id: z.number().int().nullable().optional(),
  temperature: decimalField,
  feel_temperature: decimalField,
  humidity: decimalField,
  wind_speed: decimalField,
  wind_direction: z.string().max(50).nullable().optional(),
  rainfall_probability: decimalField,
});

const WeatherIdParam = z.object({
  id: z.string(),
});

const WeatherDataListSchema = z.object({
  data: z.array(WeatherDataSchema),
});

const WeatherLocationParam = z.object({
  location_id: z.string(),
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
  WeatherLocationParam,
  listWeatherDataRoute,
  getWeatherDataRoute,
  createWeatherDataRoute,
  updateWeatherDataRoute,
  deleteWeatherDataRoute,
};
