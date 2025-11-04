import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const PrismaDecimal = z.number();

const decimalInput = z
  .union([z.number(), z.string()])
  .transform((val) => {
    if (val instanceof Decimal) return val;
    return new Decimal(val);
  })
  .nullable()
  .optional();

const WeatherDataSchema = z.object({
  id: z.number().int(),
  location_id: z.number().int().nullable(),
  temperature: PrismaDecimal.nullable(),
  feel_temperature: PrismaDecimal.nullable(),
  humidity: PrismaDecimal.nullable(),
  wind_speed: PrismaDecimal.nullable(),
  wind_direction: z.string().nullable(),
  rainfall_probability: PrismaDecimal.nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  addresses: z.any().nullable().optional(),
});

const CreateWeatherDataSchema = z.object({
  location_id: z.number().int().nullable().optional(),
  temperature: decimalInput,
  feel_temperature: decimalInput,
  humidity: decimalInput,
  wind_speed: decimalInput,
  wind_direction: z.string().max(50).nullable().optional(),
  rainfall_probability: decimalInput,
});

const UpdateWeatherDataSchema = z.object({
  location_id: z.number().int().nullable().optional(),
  temperature: decimalInput,
  feel_temperature: decimalInput,
  humidity: decimalInput,
  wind_speed: decimalInput,
  wind_direction: z.string().max(50).nullable().optional(),
  rainfall_probability: decimalInput,
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
