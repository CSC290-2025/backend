import { OpenMeteoClient, OPEN_METEO_TIMEZONE } from './open-meteo.client';
import { WeatherOpenMeteoSchemas } from '../schemas';
import type {
  ExternalRawFull,
  ExternalWeatherDTO,
  ExternalWeatherQuery,
} from '../types';
import { ValidationError } from '@/errors';
import { getDistrictByLocationId } from '../utils/bangkok-districts';

const wmoToCondition = (code: number): string => {
  if (code === 0) return 'Sunny';
  if ([1, 2, 3].includes(code)) return 'Partly Cloudy';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Cloudy';
};

const compass8 = (deg?: number | null) => {
  if (deg == null) return 'N';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
};

const toUtcIso = (localYYYYmmddHHmm: string, offsetSeconds: number): string => {
  const [date, hm] = localYYYYmmddHHmm.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [H, M] = hm.split(':').map(Number);
  const local = Date.UTC(y, m - 1, d, H, M);
  const utc = local - offsetSeconds * 1000;
  return new Date(utc).toISOString();
};

const mapFullToDTO = (
  raw: ExternalRawFull,
  city: string,
  country: string
): ExternalWeatherDTO => {
  const hourly = raw.hourly.time.map((t, i) => ({
    time: toUtcIso(t, raw.utc_offset_seconds),
    temperature: raw.hourly.temperature_2m[i],
    condition: wmoToCondition(raw.hourly.weather_code[i]),
    precipitation_chance: raw.hourly.precipitation_probability?.[i] ?? null,
  }));

  const daily = raw.daily.time.map((d, i) => ({
    date: d,
    high: raw.daily.temperature_2m_max[i],
    low: raw.daily.temperature_2m_min[i],
    condition: wmoToCondition(raw.daily.weather_code[i]),
    precipitation_chance: raw.daily.precipitation_probability_max[i] ?? null,
  }));

  return WeatherOpenMeteoSchemas.ExternalWeatherDTOSchema.parse({
    location: {
      city,
      country,
      latitude: raw.latitude,
      longitude: raw.longitude,
    },
    current: {
      temperature: raw.current.temperature_2m,
      feels_like: raw.current.apparent_temperature,
      condition: wmoToCondition(raw.current.weather_code),
      humidity: raw.current.relative_humidity_2m,
      wind_speed: raw.current.wind_speed_10m,
      wind_direction: compass8(raw.current.wind_direction_10m),
      pressure: raw.current.surface_pressure ?? null,
      last_updated: toUtcIso(raw.current.time, raw.utc_offset_seconds),
    },
    hourly_forecast: hourly,
    daily_forecast: daily,
  });
};

const getWeatherFromOpenMeteo = async (
  query: ExternalWeatherQuery
): Promise<ExternalWeatherDTO> => {
  const q = WeatherOpenMeteoSchemas.ExternalWeatherQuerySchema.parse(query);
  const district = getDistrictByLocationId(q.location_id);
  if (!district) {
    throw new ValidationError(
      `Invalid location_id: ${q.location_id}. Valid IDs are 1-4`
    );
  }
  // Open-Meteo expects a timezone; use canonical project timezone
  const json = await OpenMeteoClient.getFull(
    district.lat,
    district.lng,
    OPEN_METEO_TIMEZONE
  );
  const raw = WeatherOpenMeteoSchemas.ExternalRawFullSchema.parse(json);

  // Use district info for location name
  const city = district.name;
  const country = 'Thailand';

  return mapFullToDTO(raw, city, country);
};

const getCurrentFromOpenMeteo = async (query: ExternalWeatherQuery) => {
  const q = WeatherOpenMeteoSchemas.ExternalWeatherQuerySchema.parse(query);
  const district = getDistrictByLocationId(q.location_id);
  if (!district) {
    throw new ValidationError(
      `Invalid location_id: ${q.location_id}. Valid IDs are 1-4`
    );
  }
  const json = await OpenMeteoClient.getFull(
    district.lat,
    district.lng,
    OPEN_METEO_TIMEZONE
  );
  const raw = WeatherOpenMeteoSchemas.ExternalRawFullSchema.parse(json);
  const city = district.name;
  const country = 'Thailand';
  const full = mapFullToDTO(raw, city, country);
  return WeatherOpenMeteoSchemas.ExternalCurrentResponseSchema.parse({
    location: full.location,
    current: full.current,
  });
};

const getHourlyFromOpenMeteo = async (query: ExternalWeatherQuery) => {
  const q = WeatherOpenMeteoSchemas.ExternalWeatherQuerySchema.parse(query);
  const district = getDistrictByLocationId(q.location_id);
  if (!district) {
    throw new ValidationError(
      `Invalid location_id: ${q.location_id}. Valid IDs are 1-4`
    );
  }
  const json = await OpenMeteoClient.getFull(
    district.lat,
    district.lng,
    OPEN_METEO_TIMEZONE
  );
  const raw = WeatherOpenMeteoSchemas.ExternalRawFullSchema.parse(json);
  const city = district.name;
  const country = 'Thailand';
  const full = mapFullToDTO(raw, city, country);
  return WeatherOpenMeteoSchemas.ExternalHourlyResponseSchema.parse({
    location: full.location,
    hourly_forecast: full.hourly_forecast,
  });
};

const getDailyFromOpenMeteo = async (query: ExternalWeatherQuery) => {
  const q = WeatherOpenMeteoSchemas.ExternalWeatherQuerySchema.parse(query);
  const district = getDistrictByLocationId(q.location_id);
  if (!district) {
    throw new ValidationError(
      `Invalid location_id: ${q.location_id}. Valid IDs are 1-4`
    );
  }
  const json = await OpenMeteoClient.getFull(
    district.lat,
    district.lng,
    OPEN_METEO_TIMEZONE
  );
  const raw = WeatherOpenMeteoSchemas.ExternalRawFullSchema.parse(json);
  const city = district.name;
  const country = 'Thailand';
  const full = mapFullToDTO(raw, city, country);
  return WeatherOpenMeteoSchemas.ExternalDailyResponseSchema.parse({
    location: full.location,
    daily_forecast: full.daily_forecast,
  });
};

export {
  getWeatherFromOpenMeteo,
  getCurrentFromOpenMeteo,
  getHourlyFromOpenMeteo,
  getDailyFromOpenMeteo,
};
