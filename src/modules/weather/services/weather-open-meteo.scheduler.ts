//แปลงข้อมูล (ฟังก์ชั่นที่เก็บอดีตลง database) , // convert data (function to store past data into database)
import { OpenMeteoClient, OPEN_METEO_TIMEZONE } from './open-meteo.client';
import { WeatherOpenMeteoSchemas } from '../schemas';
import type { ExternalRawDailyOnly, ImportDailyBody } from '../types';
import { ValidationError } from '@/errors';
import { WeatherModel } from '../models';
import { getDistrictByLocationId, bangkokDistricts } from '../utils';
import prisma from '@/config/client';

// แปลงข้อมูลดิบของ Open-Meteo ให้เหลือค่าของเมื่อวานที่พร้อมบันทึก , // Convert raw Open-Meteo data to extract yesterday's values that ready for saving
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

// import ข้อมูลเมื่อวานให้ location เดียว (ตรวจ request ก่อน) , // import yesterday's data for a single location (with request validation)
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

  const resolvedAddressId = district.address_id ?? b.location_id ?? null;
  if (resolvedAddressId == null) {
    throw new ValidationError(
      `No address mapping for location_id ${b.location_id}`
    );
  }

  const address = await prisma.addresses.findUnique({
    where: { id: resolvedAddressId },
  });
  if (!address) {
    throw new ValidationError(
      `Address id ${resolvedAddressId} not found in database`
    );
  }

  const { date, payload } = pickYesterdayPayload(raw, address.id);

  console.info(
    'Importing yesterday payload to DB for location_id=',
    address.id,
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

// import ข้อมูลเมื่อวานให้ครบทุกเขตที่ระบบมี , // import yesterday's data for all districts in the system
const importAllLocationsYesterday = async () => {
  const results: Array<{
    location_id: number;
    success: boolean;
    date?: string;
    saved?: ReturnType<typeof pickYesterdayPayload>['payload'];
    error?: string;
  }> = [];

  for (const district of bangkokDistricts) {
    try {
      const result = await importYesterdayToDatabase({
        location_id: district.location_id,
      });
      results.push({
        location_id: district.location_id,
        success: true,
        date: result.date,
        saved: result.saved,
      });
    } catch (error) {
      results.push({
        location_id: district.location_id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    processed: results.length,
    results,
  };
};

export { importYesterdayToDatabase, importAllLocationsYesterday };
