import { z } from 'zod';
import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers';

const ExternalRawFullSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  current: z.object({
    time: z.string(),
    interval: z.number(),
    temperature_2m: z.number(),
    apparent_temperature: z.number(),
    weather_code: z.number(),
    relative_humidity_2m: z.number(),
    wind_speed_10m: z.number(),
    wind_direction_10m: z.number(),
    surface_pressure: z.number().nullable().optional(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    precipitation_probability: z.array(z.number()).optional(),
    weather_code: z.array(z.number()),
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    weather_code: z.array(z.number()),
    precipitation_probability_max: z.array(z.number()),
  }),
});

const ExternalRawDailyOnlySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    weather_code: z.array(z.number()),
    precipitation_probability_max: z.array(z.number()),
    apparent_temperature_max: z.array(z.number()).optional(),
    apparent_temperature_min: z.array(z.number()).optional(),
    wind_speed_10m_max: z.array(z.number()).optional(),
    wind_direction_10m_dominant: z.array(z.number()).optional(),
    precipitation_hours: z.array(z.number()).optional(),
  }),
});

const LocationSchema = z.object({
  city: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

const CurrentSchema = z.object({
  temperature: z.number(),
  feels_like: z.number(),
  condition: z.string(),
  humidity: z.number(),
  wind_speed: z.number(),
  wind_direction: z.string(),
  pressure: z.number().nullable(),
  last_updated: z.string(),
});

const HourlyItemSchema = z.object({
  time: z.string(),
  temperature: z.number(),
  condition: z.string(),
  precipitation_chance: z.number().nullable(),
});

const DailyItemSchema = z.object({
  date: z.string(),
  high: z.number(),
  low: z.number(),
  condition: z.string(),
  precipitation_chance: z.number().nullable(),
});

const ExternalWeatherDTOSchema = z.object({
  location: LocationSchema,
  current: CurrentSchema,
  hourly_forecast: z.array(HourlyItemSchema),
  daily_forecast: z.array(DailyItemSchema),
});

const ExternalWeatherQuerySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  // city/country are optional: external clients may only provide coordinates
  // Provide defaults so Swagger shows sensible defaults when omitted.
  city: z.string().min(1).optional().nullable().default('Bangkok'),
  country: z.string().min(1).optional().nullable().default('Thailand'),
});

const ImportDailyBodySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  location_id: z.coerce.number().int(),
});

const getExternalWeatherRoute = createGetRoute({
  path: '/weather/external',
  summary: 'Get live weather (Open-Meteo) mapped to internal DTO',
  query: ExternalWeatherQuerySchema,
  responseSchema: ExternalWeatherDTOSchema,
  tags: ['Weather', 'External'],
});

const importDailyRoute = createPostRoute({
  path: '/weather/external/daily-import',
  summary: 'Fetch Open-Meteo daily (past 1) and persist ONLY yesterday to DB',
  requestSchema: ImportDailyBodySchema,
  responseSchema: z.object({
    created: z.boolean(),
    date: z.string(),
    saved: z.object({
      location_id: z.number().int(),
      temperature: z.number().nullable(),
      feel_temperature: z.number().nullable(),
      humidity: z.number().nullable(),
      wind_speed: z.number().nullable(),
      wind_direction: z.string().nullable(),
      rainfall_probability: z.number().nullable(),
    }),
  }),
  tags: ['Weather', 'External'],
});

export const WeatherOpenMeteoSchemas = {
  ExternalRawFullSchema,
  ExternalRawDailyOnlySchema,
  ExternalWeatherDTOSchema,
  ExternalWeatherQuerySchema,
  ImportDailyBodySchema,
  getExternalWeatherRoute,
  importDailyRoute,
};
