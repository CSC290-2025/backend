// Schemas for interacting with Open-Meteo and documenting external routes.
import { z } from 'zod';
import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers';

// Full response shape from Open-Meteo /forecast.
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

// Response shape for the past-one-day fetch (scheduler import).
const ExternalRawDailyOnlySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  hourly: z.object({
    time: z.array(z.string()),
    relative_humidity_2m: z.array(z.number()),
  }),
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

// Location metadata attached to responses.
const LocationSchema = z.object({
  city: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

// Current weather fields after mapping.
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

// Single row for the hourly forecast.
const HourlyItemSchema = z.object({
  time: z.string(),
  temperature: z.number(),
  condition: z.string(),
  precipitation_chance: z.number().nullable(),
});

// Single row for the daily forecast.
const DailyItemSchema = z.object({
  date: z.string(),
  high: z.number(),
  low: z.number(),
  condition: z.string(),
  precipitation_chance: z.number().nullable(),
});

// Primary DTO with location/current/hourly/daily sections.
const ExternalWeatherDTOSchema = z.object({
  location: LocationSchema,
  current: CurrentSchema,
  hourly_forecast: z.array(HourlyItemSchema),
  daily_forecast: z.array(DailyItemSchema),
});

// Response schema for the current endpoint.
const ExternalCurrentResponseSchema = z.object({
  location: LocationSchema,
  current: CurrentSchema,
});

// Response schema for the hourly endpoint.
const ExternalHourlyResponseSchema = z.object({
  location: LocationSchema,
  hourly_forecast: z.array(HourlyItemSchema),
});

// Response schema for the daily endpoint.
const ExternalDailyResponseSchema = z.object({
  location: LocationSchema,
  daily_forecast: z.array(DailyItemSchema),
});

// Query schema accepting location_id 1-4.
const ExternalWeatherQuerySchema = z.object({
  location_id: z.coerce.number().int().min(1).max(4),
});

// Body schema for /daily-import (single location).
const ImportDailyBodySchema = z.object({
  location_id: z.coerce.number().int().min(1).max(4),
});

// Payload structure saved into weather_data.
const SavedDailyPayloadSchema = z.object({
  location_id: z.number().int(),
  temperature: z.number().nullable(),
  feel_temperature: z.number().nullable(),
  humidity: z.number().nullable(),
  wind_speed: z.number().nullable(),
  wind_direction: z.string().nullable(),
  rainfall_probability: z.number().nullable(),
});

// Ensures /daily-import/all receives an empty body.
const EmptyBodySchema = z.object({}).strict();

const WeatherAutoImportStatusSchema = z.object({
  enabled: z.boolean(),
  cron: z.string(),
  timezone: z.string(),
  lastRunAt: z.string().nullable(),
  lastResult: z
    .object({
      success: z.boolean(),
      message: z.string().optional(),
    })
    .nullable(),
  running: z.boolean(),
});

// Route meta: GET current.
const getExternalCurrentRoute = createGetRoute({
  path: '/weather/external/current',
  summary:
    'Get current weather (Open-Meteo) by Bangkok district (location_id 1-4)',
  query: ExternalWeatherQuerySchema,
  responseSchema: ExternalCurrentResponseSchema,
  tags: ['Weather', 'External'],
});

// Route meta: GET hourly.
const getExternalHourlyRoute = createGetRoute({
  path: '/weather/external/hourly',
  summary:
    'Get hourly forecast (Open-Meteo) by Bangkok district (location_id 1-4)',
  query: ExternalWeatherQuerySchema,
  responseSchema: ExternalHourlyResponseSchema,
  tags: ['Weather', 'External'],
});

// Route meta: GET daily forecast.
const getExternalDailyRoute = createGetRoute({
  path: '/weather/external/daily',
  summary:
    'Get daily forecast (Open-Meteo) by Bangkok district (location_id 1-4)',
  query: ExternalWeatherQuerySchema,
  responseSchema: ExternalDailyResponseSchema,
  tags: ['Weather', 'External'],
});

// Route meta: POST daily import for a single location.
const importDailyRoute = createPostRoute({
  path: '/weather/external/daily-import',
  summary:
    'Fetch Open-Meteo daily (past 1) for Bangkok district and persist yesterday to DB',
  requestSchema: ImportDailyBodySchema,
  responseSchema: z.object({
    created: z.boolean(),
    date: z.string(),
    saved: SavedDailyPayloadSchema,
  }),
  tags: ['Weather', 'External'],
});

// Route meta: POST daily import for every location.
const importDailyAllRoute = createPostRoute({
  path: '/weather/external/daily-import/all',
  summary:
    'Fetch Open-Meteo daily (past 1) for all Bangkok districts and persist yesterday to DB',
  requestSchema: EmptyBodySchema,
  responseSchema: z.object({
    processed: z.number().int(),
    results: z.array(
      z.object({
        location_id: z.number().int(),
        success: z.boolean(),
        date: z.string().optional(),
        saved: SavedDailyPayloadSchema.optional(),
        error: z.string().optional(),
      })
    ),
  }),
  tags: ['Weather', 'External'],
});

const getWeatherAutoImportStatusRoute = createGetRoute({
  path: '/weather/external/daily-import/auto/status',
  summary:
    'Get daily auto-import status (runs at 00:05 Asia/Bangkok when enabled)',
  responseSchema: WeatherAutoImportStatusSchema,
  tags: ['Weather', 'External'],
});

const startWeatherAutoImportRoute = createPostRoute({
  path: '/weather/external/daily-import/auto/start',
  summary:
    'Enable daily auto-import at 00:05 Asia/Bangkok (no immediate fetch)',
  requestSchema: EmptyBodySchema,
  responseSchema: WeatherAutoImportStatusSchema,
  tags: ['Weather', 'External'],
});

const stopWeatherAutoImportRoute = createPostRoute({
  path: '/weather/external/daily-import/auto/stop',
  summary: 'Disable the daily auto-import scheduler',
  requestSchema: EmptyBodySchema,
  responseSchema: WeatherAutoImportStatusSchema,
  tags: ['Weather', 'External'],
});

export const WeatherOpenMeteoSchemas = {
  ExternalRawFullSchema,
  ExternalRawDailyOnlySchema,
  ExternalWeatherDTOSchema,
  ExternalCurrentResponseSchema,
  ExternalHourlyResponseSchema,
  ExternalDailyResponseSchema,
  ExternalWeatherQuerySchema,
  ImportDailyBodySchema,
  SavedDailyPayloadSchema,
  EmptyBodySchema,
  getExternalCurrentRoute,
  getExternalHourlyRoute,
  getExternalDailyRoute,
  importDailyRoute,
  importDailyAllRoute,
  getWeatherAutoImportStatusRoute,
  startWeatherAutoImportRoute,
  stopWeatherAutoImportRoute,
};
