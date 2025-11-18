// schema ที่ใช้คุยกับ Open-Meteo และอธิบาย response/route external
import { z } from 'zod';
import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers';

// รูปแบบ response เต็มจาก Open-Meteo /forecast
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

// รูปแบบ response กรณีดึงย้อนหลัง 1 วัน (ใช้ใน scheduler)
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

// metadata เมือง/พิกัดที่จะแนบกลับใน response
const LocationSchema = z.object({
  city: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

// ข้อมูล current weather หลัง map แล้ว
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

// 1 แถวของ hourly forecast
const HourlyItemSchema = z.object({
  time: z.string(),
  temperature: z.number(),
  condition: z.string(),
  precipitation_chance: z.number().nullable(),
});

// 1 แถวของ daily forecast
const DailyItemSchema = z.object({
  date: z.string(),
  high: z.number(),
  low: z.number(),
  condition: z.string(),
  precipitation_chance: z.number().nullable(),
});

// DTO หลักที่รวม location/current/hourly/daily
const ExternalWeatherDTOSchema = z.object({
  location: LocationSchema,
  current: CurrentSchema,
  hourly_forecast: z.array(HourlyItemSchema),
  daily_forecast: z.array(DailyItemSchema),
});

// schema ที่ endpoint current ใช้ตอบกลับ
const ExternalCurrentResponseSchema = z.object({
  location: LocationSchema,
  current: CurrentSchema,
});

// schema สำหรับตอบ hourly
const ExternalHourlyResponseSchema = z.object({
  location: LocationSchema,
  hourly_forecast: z.array(HourlyItemSchema),
});

// schema สำหรับตอบ daily
const ExternalDailyResponseSchema = z.object({
  location: LocationSchema,
  daily_forecast: z.array(DailyItemSchema),
});

// รับ location_id 1-4 จาก query string
const ExternalWeatherQuerySchema = z.object({
  location_id: z.coerce.number().int().min(1).max(4),
});

// ใช้กับ body ของ /daily-import (location เดียว)
const ImportDailyBodySchema = z.object({
  location_id: z.coerce.number().int().min(1).max(4),
});

// รูปแบบข้อมูลที่ save ลง weather_data
const SavedDailyPayloadSchema = z.object({
  location_id: z.number().int(),
  temperature: z.number().nullable(),
  feel_temperature: z.number().nullable(),
  humidity: z.number().nullable(),
  wind_speed: z.number().nullable(),
  wind_direction: z.string().nullable(),
  rainfall_probability: z.number().nullable(),
});

// ใช้ยืนยันว่า import all ไม่ควรมี body
const EmptyBodySchema = z.object({}).strict();

// route meta: GET current
const getExternalCurrentRoute = createGetRoute({
  path: '/weather/external/current',
  summary:
    'Get current weather (Open-Meteo) by Bangkok district (location_id 1-4)',
  query: ExternalWeatherQuerySchema,
  responseSchema: ExternalCurrentResponseSchema,
  tags: ['Weather', 'External'],
});

// route meta: GET hourly
const getExternalHourlyRoute = createGetRoute({
  path: '/weather/external/hourly',
  summary:
    'Get hourly forecast (Open-Meteo) by Bangkok district (location_id 1-4)',
  query: ExternalWeatherQuerySchema,
  responseSchema: ExternalHourlyResponseSchema,
  tags: ['Weather', 'External'],
});

// route meta: GET daily forecast
const getExternalDailyRoute = createGetRoute({
  path: '/weather/external/daily',
  summary:
    'Get daily forecast (Open-Meteo) by Bangkok district (location_id 1-4)',
  query: ExternalWeatherQuerySchema,
  responseSchema: ExternalDailyResponseSchema,
  tags: ['Weather', 'External'],
});

// route meta: POST import รายวันของ location เดียว
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

// route meta: POST import รายวันให้ทุก location
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
};
