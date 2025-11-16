import { OpenMeteoClient, OPEN_METEO_TIMEZONE } from './open-meteo.client';
import { WeatherOpenMeteoSchemas } from '../schemas';
import type { ExternalRawDailyOnly, ImportDailyBody } from '../types';
import { ValidationError } from '@/errors';
import { WeatherModel } from '../models';
import { getDistrictByLocationId } from '../utils';
import prisma from '@/config/client';

const pickYesterdayPayload = (
  raw: ExternalRawDailyOnly,
  location_id: number | null,
  nowUtc = Date.now()
) => {
  const offset = raw.utc_offset_seconds * 1000;
  const localNow = nowUtc + offset;
  const localY = new Date(localNow - 24 * 3600 * 1000);
  const yyyy = localY.getUTCFullYear();
  const mm = String(localY.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(localY.getUTCDate()).padStart(2, '0');
  const target = `${yyyy}-${mm}-${dd}`;

  const idx = raw.daily.time.indexOf(target);
  const use = Math.max(idx, 0);

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
      location_id: location_id ?? null,
      temperature: avg(tmax ?? null, tmin ?? null),
      feel_temperature: avg(appMax, appMin),
      humidity: null,
      wind_speed: wsMax,
      wind_direction: wd,
      rainfall_probability: pMax ?? null,
    },
  };
};

const importYesterdayToDatabase = async (body: ImportDailyBody) => {
  const b = WeatherOpenMeteoSchemas.ImportDailyBodySchema.parse(body);
  const district = getDistrictByLocationId(b.location_id);
  if (!district) {
    throw new ValidationError(
      `Invalid location_id: ${b.location_id}. Valid IDs are 1-4`
    );
  }
  const json = await OpenMeteoClient.getDailyPastOne(
    district.lat,
    district.lng,
    OPEN_METEO_TIMEZONE
  );
  const raw = WeatherOpenMeteoSchemas.ExternalRawDailyOnlySchema.parse(json);

  let locId: number | null = b.location_id ?? null;
  if (locId != null) {
    const addr = await prisma.addresses.findUnique({ where: { id: locId } });
    if (!addr) locId = null;
  }

  const { date, payload } = pickYesterdayPayload(raw, locId);

  console.info(
    'Importing yesterday payload to DB for location_id=',
    locId,
    'payload=',
    payload
  );
  let created;
  try {
    created = await WeatherModel.create(payload);
  } catch (err) {
    console.error('Failed to create weather_data in scheduler:', err);
    throw err;
  }

  return {
    created: !!created,
    date,
    saved: payload,
  };
};

export { importYesterdayToDatabase };
