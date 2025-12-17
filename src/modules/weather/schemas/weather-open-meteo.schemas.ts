// Schemas for interacting with Open-Meteo and documenting external routes.
import { z } from 'zod';
import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers';

const YYYY_MM_DD = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u;

const DateOnlySchema = z
  .string()
  .transform((value, ctx) => {
    const normalized = value.includes('T')
      ? (value.split('T')[0] ?? value)
      : value;
    if (!YYYY_MM_DD.test(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Date must be YYYY-MM-DD',
      });
      return z.NEVER;
    }
    return normalized;
  })
  .openapi({ format: 'date', description: 'Date in YYYY-MM-DD (Bangkok)' });

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

const ExternalRainWindowSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  hourly: z.object({
    time: z.array(z.string()),
    precipitation_probability: z.array(z.number()).optional(),
    rain: z.array(z.number()).optional(),
    weather_code: z.array(z.number()),
  }),
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
    precipitation_hours: z.array(z.number()).optional(),
    precipitation_sum: z.array(z.number()).optional(),
    precipitation_probability_max: z.array(z.number()).optional(),
    rain_sum: z.array(z.number()).optional(),
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

const RainDailyItemSchema = z.object({
  date: z.string(),
  condition: z.string(),
  precipitation_hours: z.number().nullable(),
  precipitation_sum: z.number().nullable(),
  precipitation_probability_max: z.number().nullable(),
  rain_sum: z.number().nullable(),
});

const RainHourlyItemSchema = z.object({
  time: z.string(),
  precipitation_probability: z.number().nullable(),
  rain: z.number().nullable(),
  condition: z.string(),
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

const RainDailyResponseSchema = z.object({
  location: LocationSchema,
  range: z.object({
    start: z.string(),
    end: z.string(),
    days_ahead: z.number().int(),
  }),
  days: z.array(RainDailyItemSchema),
});

const RainHourlyResponseSchema = z.object({
  location: LocationSchema,
  date: z.string(),
  hourly: z.array(RainHourlyItemSchema),
});

// Query schema accepting location_id 1-4.
const ExternalWeatherQuerySchema = z.object({
  location_id: z.coerce.number().int().min(1).max(4),
});

const RainDailyQuerySchema = z.object({
  location_id: z.coerce.number().int().min(1).max(4),
  date: DateOnlySchema,
  days_ahead: z.coerce.number().int().min(0).max(7).optional(),
});

const RainHourlyQuerySchema = z.object({
  location_id: z.coerce.number().int().min(1).max(4),
  date: DateOnlySchema,
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

const getRainDailyRoute = createGetRoute({
  path: '/weather/external/rain/daily',
  summary:
    'Get rain-focused daily metrics for location_id (1-4) starting from date=YYYY-MM-DD with optional days_ahead=0-7 (Open-Meteo allows up to ~16 days overall)',
  query: RainDailyQuerySchema,
  responseSchema: RainDailyResponseSchema,
  tags: ['Weather', 'External'],
});

const getRainHourlyRoute = createGetRoute({
  path: '/weather/external/rain/hourly',
  summary:
    'Get rain-focused hourly forecast for location_id (1-4) on date=YYYY-MM-DD (date must be inside Open-Meteo forecast horizon ~16 days)',
  query: RainHourlyQuerySchema,
  responseSchema: RainHourlyResponseSchema,
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

// Each entry below maps a documented external/proxy use case so route registration
// code can pull a single object and stay agnostic of the underlying schema details.
export const WeatherOpenMeteoSchemas = {
  ExternalRawFullSchema,
  ExternalRawDailyOnlySchema,
  ExternalRainWindowSchema,
  ExternalWeatherDTOSchema,
  ExternalCurrentResponseSchema,
  ExternalHourlyResponseSchema,
  ExternalDailyResponseSchema,
  RainDailyResponseSchema,
  RainHourlyResponseSchema,
  ExternalWeatherQuerySchema,
  RainDailyQuerySchema,
  RainHourlyQuerySchema,
  ImportDailyBodySchema,
  SavedDailyPayloadSchema,
  EmptyBodySchema,
  getExternalCurrentRoute,
  getExternalHourlyRoute,
  getExternalDailyRoute,
  getRainDailyRoute,
  getRainHourlyRoute,
  importDailyRoute,
  importDailyAllRoute,
};
