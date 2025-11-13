import { OpenMeteoClient } from './open-meteo.client';
import { ExternalWeatherSchemas } from '../schemas';
import type {
  ExternalRawFull,
  ExternalRawDailyOnly,
  ExternalWeatherDTO,
  ExternalWeatherQuery,
  ImportDailyBody,
} from '../types';
import { ValidationError } from '@/errors';
import { WeatherModel } from '../models';

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
  const local = Date.UTC(y, m - 1, d, H, M); // epoch ของ local
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

  return ExternalWeatherSchemas.ExternalWeatherDTOSchema.parse({
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

const pickYesterdayPayload = (
  raw: ExternalRawDailyOnly,
  location_id: number,
  nowUtc = Date.now()
) => {
  const offset = raw.utc_offset_seconds * 1000;
  const localNow = nowUtc + offset;
  const localY = new Date(localNow - 24 * 3600 * 1000);
  const yyyy = localY.getUTCFullYear();
  const mm = String(localY.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(localY.getUTCDate()).padStart(2, '0');
  const target = `${yyyy}-${mm}-${dd}`;

  const idx = raw.daily.time.findIndex((d) => d === target);
  const use = idx >= 0 ? idx : 0;

  const tmax = raw.daily.temperature_2m_max[use];
  const tmin = raw.daily.temperature_2m_min[use];
  const appMax = raw.daily.apparent_temperature_max?.[use] ?? null;
  const appMin = raw.daily.apparent_temperature_min?.[use] ?? null;
  const wsMax = raw.daily.wind_speed_10m_max?.[use] ?? null;
  const degDom = raw.daily.wind_direction_10m_dominant?.[use] ?? null;
  const pMax = raw.daily.precipitation_probability_max?.[use] ?? null;

  const avg = (a: number | null, b: number | null) =>
    a == null || b == null ? (a ?? b ?? null) : (a + b) / 2;

  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const wd = degDom == null ? null : dirs[Math.round(degDom / 45) % 8];

  return {
    date: raw.daily.time[use],
    payload: {
      location_id,
      temperature: avg(tmax ?? null, tmin ?? null),
      feel_temperature: avg(appMax, appMin),
      humidity: null,
      wind_speed: wsMax,
      wind_direction: wd,
      rainfall_probability: pMax ?? null,
    },
  };
};

const getExternalWeather = async (
  query: ExternalWeatherQuery
): Promise<ExternalWeatherDTO> => {
  const q = ExternalWeatherSchemas.ExternalWeatherQuerySchema.parse(query);
  if (!Number.isFinite(q.lat) || !Number.isFinite(q.lon)) {
    throw new ValidationError('Invalid coordinates');
  }
  const json = await OpenMeteoClient.getFull(q.lat, q.lon);
  const raw = ExternalWeatherSchemas.ExternalRawFullSchema.parse(json);
  return mapFullToDTO(raw, q.city, q.country);
};

const importDaily = async (body: ImportDailyBody) => {
  const b = ExternalWeatherSchemas.ImportDailyBodySchema.parse(body);
  if (!Number.isFinite(b.lat) || !Number.isFinite(b.lon)) {
    throw new ValidationError('Invalid coordinates');
  }
  const json = await OpenMeteoClient.getDailyPastOne(b.lat, b.lon);
  const raw = ExternalWeatherSchemas.ExternalRawDailyOnlySchema.parse(json);

  const { date, payload } = pickYesterdayPayload(raw, b.location_id);

  const created = await WeatherModel.create(payload as any);

  return {
    created: !!created,
    date,
    saved: payload,
  };
};

export { getExternalWeather, importDaily };
