import https from 'https';
import { CleanAirConfigurationError, CleanAirProviderError } from '../error';
import type {
  Air4ThaiApiResponse,
  Air4ThaiDistrictAirQuality,
  Air4ThaiService as Air4ThaiServiceContract,
  Air4ThaiStation,
  AirQualityCategory,
} from '../types';

interface TargetDistrict {
  name: string;
  keywords: string[];
}

const AIR4THAI_TARGET_DISTRICTS: TargetDistrict[] = [
  { name: 'Thung Kru', keywords: ['thung khru', 'thung kru'] },
  { name: 'Rat Burana', keywords: ['rat burana'] },
  { name: 'Thonburi', keywords: ['thon buri', 'thonburi'] },
  { name: 'Chom Thong', keywords: ['chom thong', 'chomthong', 'jomtong'] },
];

export const AIR4THAI_DISTRICT_NAMES = AIR4THAI_TARGET_DISTRICTS.map(
  (district) => district.name
);

export function resolveCategory(aqi: number): AirQualityCategory {
  if (aqi <= 50) return 'GOOD';
  if (aqi <= 100) return 'MODERATE';
  if (aqi <= 150) return 'UNHEALTHY_FOR_SENSITIVE';
  if (aqi <= 200) return 'UNHEALTHY';
  if (aqi <= 300) return 'VERY_UNHEALTHY';
  return 'HAZARDOUS';
}

function getConfiguredUrl(): string {
  const url = process.env.G05_AIR4THAI_API_URL;
  if (!url) {
    throw new CleanAirConfigurationError('AIR4THAI_API_URL is not configured');
  }
  return url;
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }
  return 0;
}

function toIsoTimestamp(date?: string, time?: string): string {
  if (!date) {
    return new Date().toISOString();
  }
  const safeTime = time && time.includes(':') ? time : '00:00';
  const candidate = `${date}T${
    safeTime.length === 5 ? `${safeTime}:00` : safeTime
  }+07:00`;
  const parsed = Date.parse(candidate);
  return Number.isNaN(parsed)
    ? new Date().toISOString()
    : new Date(parsed).toISOString();
}

function stationText(station: Air4ThaiStation): string {
  return [
    station.areaEN,
    station.nameEN,
    station.stationNameEN,
    station.areaTH,
    station.nameTH,
    station.stationNameTH,
  ]
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLowerCase();
}

function isMatchingDistrict(station: Air4ThaiStation, target: TargetDistrict) {
  const text = stationText(station);
  return target.keywords.some((keyword) => text.includes(keyword));
}

function stationTimestamp(station: Air4ThaiStation): number {
  const aqi = station.AQILast;
  if (!aqi) {
    return 0;
  }
  const iso = toIsoTimestamp(aqi.date, aqi.time);
  return Date.parse(iso);
}

function toDistrictRecord(
  district: string,
  station: Air4ThaiStation
): Air4ThaiDistrictAirQuality {
  const aqiInfo = station.AQILast;
  const aqiValue = parseNumber(aqiInfo?.AQI?.aqi);
  const pm25Value = parseNumber(aqiInfo?.PM25?.value);
  const measuredAt = toIsoTimestamp(aqiInfo?.date, aqiInfo?.time);

  return {
    district,
    province: 'Bangkok',
    aqi: aqiValue,
    pm25: pm25Value,
    category: resolveCategory(aqiValue),
    measured_at: measuredAt,
  };
}

function emptyDistrictRecord(district: string): Air4ThaiDistrictAirQuality {
  return {
    district,
    province: 'Bangkok',
    aqi: 0,
    pm25: 0,
    category: resolveCategory(0),
    measured_at: new Date().toISOString(),
  };
}

async function fetchStations(): Promise<Air4ThaiStation[]> {
  const url = getConfiguredUrl();
  try {
    const rawText = await new Promise<string>((resolve, reject) => {
      const request = https.request(
        url,
        { method: 'GET', rejectUnauthorized: false },
        (response) => {
          if (response.statusCode && response.statusCode >= 400) {
            reject(
              new Error(
                `Request failed with status ${response.statusCode}: ${
                  response.statusMessage ?? ''
                }`
              )
            );
            response.resume();
            return;
          }

          response.setEncoding('utf8');
          const chunks: string[] = [];

          response.on('data', (chunk) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            resolve(chunks.join(''));
          });
        }
      );

      const timeout = setTimeout(() => {
        request.destroy(new Error('Request timed out'));
      }, 15000);

      request.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      request.on('close', () => {
        clearTimeout(timeout);
      });

      request.end();
    });

    let payload: unknown = rawText;
    if (rawText.trim().length > 0) {
      try {
        payload = JSON.parse(rawText);
      } catch (error) {
        console.log('fetchStations parse error', error);
      }
    }

    const data = payload as Air4ThaiApiResponse;
    if (Array.isArray(data?.stations) && data.stations.length > 0) {
      return data.stations;
    }
    if (Array.isArray(data?.Station) && data.Station.length > 0) {
      return data.Station;
    }
    return [];
  } catch (error) {
    console.log('fetchStations error', error);
    throw new CleanAirProviderError(
      'Failed to fetch data from Air4Thai',
      'air4thai'
    );
  }
}

async function getBangkokDistrictAQI(): Promise<Air4ThaiDistrictAirQuality[]> {
  const stations = await fetchStations();
  const results: Air4ThaiDistrictAirQuality[] = [];

  AIR4THAI_TARGET_DISTRICTS.forEach((target) => {
    const matches = stations
      .filter((station) => isMatchingDistrict(station, target))
      .sort((a, b) => stationTimestamp(b) - stationTimestamp(a));

    if (matches.length === 0) {
      results.push(emptyDistrictRecord(target.name));
      return;
    }

    results.push(toDistrictRecord(target.name, matches[0]));
  });

  return results;
}

export const Air4ThaiService: Air4ThaiServiceContract = {
  getBangkokDistrictAQI,
};

export { getBangkokDistrictAQI };
