import { OpenMeteoClient, OPEN_METEO_TIMEZONE } from './open-meteo.client';
import { WeatherOpenMeteoSchemas } from '../schemas';
import type {
  ExternalRawFull,
  ExternalWeatherDTO,
  ExternalWeatherQuery,
  RainDailyQuery,
  RainHourlyQuery,
} from '../types';
import { ValidationError } from '@/errors';
import { getDistrictByLocationId } from '../utils/bangkok-districts';

// Map numeric WMO weather codes to concise, human-readable labels.
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

// Provide a safe label when the provider omits or nulls the weather code.
const conditionFromCode = (code?: number | null): string => {
  if (typeof code === 'number') {
    return wmoToCondition(code);
  }
  return 'Unknown';
};

// Convert wind-bearing degrees into one of eight compass abbreviations.
const compass8 = (deg?: number | null) => {
  if (deg == null) return 'N';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
};

// Convert the provider's local timestamp into a UTC ISO string.
const toUtcIso = (localYYYYmmddHHmm: string, offsetSeconds: number): string => {
  const [date, hm] = localYYYYmmddHHmm.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [H, M] = hm.split(':').map(Number);
  const local = Date.UTC(y, m - 1, d, H, M);
  const utc = local - offsetSeconds * 1000;
  return new Date(utc).toISOString();
};

// Keep the requested horizon inside the 0-7 day window we support.
const clampDaysAhead = (value?: number | null) => {
  if (value == null) {
    return 7;
  }
  return Math.min(Math.max(value, 0), 7);
};

// Return YYYY-MM-DD after adding N days (UTC math avoids timezone drift).
const addDaysToDate = (date: string, days: number) => {
  const [y, m, d] = date.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
};

// Normalize the full Open-Meteo payload into the DTO consumed by our API.
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

// Fetch the full Open-Meteo payload and return only the current snapshot.
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

// Fetch the full Open-Meteo payload and return only the hourly forecast.
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

// Fetch the full Open-Meteo payload and return only the daily forecast.
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

// Fetch precipitation-focused daily metrics for a location/date window.
const getRainDailyWindow = async (query: RainDailyQuery) => {
  const q = WeatherOpenMeteoSchemas.RainDailyQuerySchema.parse(query);
  const district = getDistrictByLocationId(q.location_id);
  if (!district) {
    throw new ValidationError(
      `Invalid location_id: ${q.location_id}. Valid IDs are 1-4`
    );
  }

  const daysAhead = clampDaysAhead(q.days_ahead);
  const startDate = q.date;
  const endDate = addDaysToDate(startDate, daysAhead);

  const json = await OpenMeteoClient.getRainWindow(
    district.lat,
    district.lng,
    startDate,
    endDate,
    OPEN_METEO_TIMEZONE
  );
  const raw = WeatherOpenMeteoSchemas.ExternalRainWindowSchema.parse(json);

  const days = raw.daily.time.map((date, index) => ({
    date,
    condition: conditionFromCode(raw.daily.weather_code[index]),
    precipitation_hours: raw.daily.precipitation_hours?.[index] ?? null,
    precipitation_sum: raw.daily.precipitation_sum?.[index] ?? null,
    precipitation_probability_max:
      raw.daily.precipitation_probability_max?.[index] ?? null,
    rain_sum: raw.daily.rain_sum?.[index] ?? null,
  }));

  return WeatherOpenMeteoSchemas.RainDailyResponseSchema.parse({
    location: {
      city: district.name,
      country: 'Thailand',
      latitude: raw.latitude,
      longitude: raw.longitude,
    },
    range: {
      start: startDate,
      end: endDate,
      days_ahead: daysAhead,
    },
    days,
  });
};

// Fetch precipitation-focused hourly metrics for a single location day.
const getRainHourlyByDate = async (query: RainHourlyQuery) => {
  const q = WeatherOpenMeteoSchemas.RainHourlyQuerySchema.parse(query);
  const district = getDistrictByLocationId(q.location_id);
  if (!district) {
    throw new ValidationError(
      `Invalid location_id: ${q.location_id}. Valid IDs are 1-4`
    );
  }

  const json = await OpenMeteoClient.getRainWindow(
    district.lat,
    district.lng,
    q.date,
    q.date,
    OPEN_METEO_TIMEZONE
  );
  const raw = WeatherOpenMeteoSchemas.ExternalRainWindowSchema.parse(json);

  const hourly = raw.hourly.time.reduce<
    Array<{
      time: string;
      precipitation_probability: number | null;
      rain: number | null;
      condition: string;
    }>
  >((acc, time, index) => {
    if (time.startsWith(q.date)) {
      acc.push({
        time,
        precipitation_probability:
          raw.hourly.precipitation_probability?.[index] ?? null,
        rain: raw.hourly.rain?.[index] ?? null,
        condition: conditionFromCode(raw.hourly.weather_code[index]),
      });
    }
    return acc;
  }, []);

  return WeatherOpenMeteoSchemas.RainHourlyResponseSchema.parse({
    location: {
      city: district.name,
      country: 'Thailand',
      latitude: raw.latitude,
      longitude: raw.longitude,
    },
    date: q.date,
    hourly,
  });
};

export {
  getCurrentFromOpenMeteo,
  getHourlyFromOpenMeteo,
  getDailyFromOpenMeteo,
  getRainDailyWindow,
  getRainHourlyByDate,
};
