import { ValidationError } from '@/errors';
import { CleanAirConfigurationError, CleanAirProviderError } from '../error';

import type {
  CleanAirService as CleanAirServiceContract,
  DistrictAirQuality,
  DistrictDetail,
  DistrictDetailData,
  DistrictHistory,
  DistrictSummary,
  SearchDistrictQuery,
} from '../types';

export const bangkokDistricts = [
  { name: 'Thung Khru', lat: 13.632160030710809, lng: 100.4911907279456 },
  { name: 'Rat Burana', lat: 13.684452, lng: 100.6 },
  { name: 'Thon Buri', lat: 13.720639, lng: 100.488936 },
  { name: 'Chom Thong', lat: 13.687762, lng: 100.477365 },
];

const DEFAULT_CURRENT_PARAMS = 'pm10,pm2_5,nitrogen_dioxide,ozone';
const DETAIL_CURRENT_PARAMS =
  'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone';
const HISTORY_HOURLY_PARAMS =
  'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone';
const HISTORY_PAST_DAYS = 7;

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

function buildQuery(params: Record<string, QueryValue>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null) {
          searchParams.append(key, String(entry));
        }
      });
      return;
    }
    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function fetchJson<T>(
  url: string,
  params: Record<string, QueryValue>,
  timeoutMs = 15000
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${url}${buildQuery(params)}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${text.slice(0, 200)}`
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function getAirCategory(aqi: number) {
  if (aqi <= 50) return 'GOOD';
  if (aqi <= 100) return 'MODERATE';
  if (aqi <= 150) return 'UNHEALTHY_FOR_SENSITIVE';
  if (aqi <= 200) return 'UNHEALTHY';
  if (aqi <= 300) return 'VERY_UNHEALTHY';
  return 'HAZARDOUS';
}

function calculateAQI(pm25: number) {
  if (pm25 <= 12) return Math.round((50 / 12) * pm25);
  if (pm25 <= 35.4) {
    return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
  }
  if (pm25 <= 55.4) {
    return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
  }
  if (pm25 <= 150.4) {
    return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
  }
  if (pm25 <= 250.4) {
    return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
  }
  return Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301);
}

function toArray(value: unknown): any[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null) {
    return [];
  }
  return [value];
}

function makeSafeNumber(value: unknown): number {
  if (Array.isArray(value)) {
    return value.length ? makeSafeNumber(value[0]) : 0;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function makeTimestamp(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return new Date().toISOString();
    }
    return makeTimestamp(value[0]);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString();
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }
  return new Date().toISOString();
}

async function fetchCurrentAirQuality(
  baseUrl: string,
  lat: number,
  lng: number,
  currentParams: string = DEFAULT_CURRENT_PARAMS
): Promise<any> {
  try {
    const url = `${baseUrl}/air-quality`;
    const data = await fetchJson<Record<string, any>>(url, {
      latitude: lat,
      longitude: lng,
      current: currentParams,
      timezone: 'Asia/Bangkok',
      domains: 'cams_global',
      timeformat: 'unixtime',
    });

    if (!data || !data.current) {
      console.log('fetchCurrentAirQuality no data', data);
      throw new CleanAirProviderError(
        'Invalid response from air quality provider',
        'open-meteo'
      );
    }

    return data.current;
  } catch (error) {
    console.log('fetchCurrentAirQuality error', error);
    throw new CleanAirProviderError(
      'Failed to fetch air quality data from provider',
      'open-meteo'
    );
  }
}

async function fetchHourlyAirQuality(
  baseUrl: string,
  lat: number,
  lng: number,
  hourlyParams: string = HISTORY_HOURLY_PARAMS
): Promise<any> {
  try {
    const url = `${baseUrl}/air-quality`;
    const data = await fetchJson<Record<string, any>>(url, {
      latitude: lat,
      longitude: lng,
      hourly: hourlyParams,
      past_days: HISTORY_PAST_DAYS,
      forecast_days: 1,
      timezone: 'Asia/Bangkok',
      domains: 'cams_global',
      timeformat: 'unixtime',
    });

    if (!data || !data.hourly) {
      console.log('fetchHourlyAirQuality no data', data);
      throw new CleanAirProviderError(
        'Invalid response from air quality provider',
        'open-meteo'
      );
    }

    return data.hourly;
  } catch (error) {
    console.log('fetchHourlyAirQuality error', error);
    throw new CleanAirProviderError(
      'Failed to fetch air quality history from provider',
      'open-meteo'
    );
  }
}

function aggregateHourlyHistory(
  hourly: Record<string, unknown>,
  limitDays: number
): DistrictDetailData[] {
  const times = toArray(hourly?.time);
  if (times.length === 0) {
    return [];
  }

  const pm25Values = toArray(hourly?.pm2_5);
  const pm10Values = toArray(hourly?.pm10);
  const coValues = toArray(hourly?.carbon_monoxide);
  const no2Values = toArray(hourly?.nitrogen_dioxide);
  const so2Values = toArray(hourly?.sulphur_dioxide);
  const o3Values = toArray(hourly?.ozone);

  const buckets: Record<
    string,
    {
      count: number;
      pm25: number;
      pm10: number;
      co: number;
      no2: number;
      so2: number;
      o3: number;
      lastTimestamp: string;
    }
  > = {};

  for (let i = 0; i < times.length; i += 1) {
    const rawTime = times[i];
    const isoTime = makeTimestamp(rawTime);
    const dayKey = isoTime.slice(0, 10);

    if (!buckets[dayKey]) {
      buckets[dayKey] = {
        count: 0,
        pm25: 0,
        pm10: 0,
        co: 0,
        no2: 0,
        so2: 0,
        o3: 0,
        lastTimestamp: isoTime,
      };
    }

    const bucket = buckets[dayKey];
    bucket.count += 1;
    bucket.pm25 += makeSafeNumber(pm25Values[i]);
    bucket.pm10 += makeSafeNumber(pm10Values[i]);
    bucket.co += makeSafeNumber(coValues[i]);
    bucket.no2 += makeSafeNumber(no2Values[i]);
    bucket.so2 += makeSafeNumber(so2Values[i]);
    bucket.o3 += makeSafeNumber(o3Values[i]);
    bucket.lastTimestamp = isoTime;
  }

  const sortedKeys = Object.keys(buckets).sort().reverse();
  const history: DistrictDetailData[] = [];

  for (let i = 0; i < sortedKeys.length; i += 1) {
    const key = sortedKeys[i];
    const bucket = buckets[key];
    const divisor = bucket.count || 1;
    const pm25Avg = bucket.pm25 / divisor;
    const pm10Avg = bucket.pm10 / divisor;
    const coAvg = bucket.co / divisor;
    const no2Avg = bucket.no2 / divisor;
    const so2Avg = bucket.so2 / divisor;
    const o3Avg = bucket.o3 / divisor;
    const aqi = calculateAQI(pm25Avg);

    history.push({
      aqi: Math.round(aqi),
      pm25: Number(pm25Avg.toFixed(1)),
      pm10: Number(pm10Avg.toFixed(1)),
      co: Number(coAvg.toFixed(1)),
      no2: Number(no2Avg.toFixed(1)),
      so2: Number(so2Avg.toFixed(1)),
      o3: Number(o3Avg.toFixed(1)),
      category: getAirCategory(aqi),
      measured_at: bucket.lastTimestamp,
    });
  }

  return history.slice(0, limitDays);
}

async function getDistricts(): Promise<DistrictAirQuality[]> {
  const baseUrl = process.env.G05_OPEN_METEO_BASE_URL;
  if (!baseUrl) {
    throw new CleanAirConfigurationError(
      'OPEN_METEO_BASE_URL is not configured'
    );
  }

  const results: DistrictAirQuality[] = [];

  for (let i = 0; i < bangkokDistricts.length; i += 1) {
    const district = bangkokDistricts[i];
    const current = await fetchCurrentAirQuality(
      baseUrl,
      district.lat,
      district.lng
    );
    const pm25Value = makeSafeNumber(current?.pm2_5);
    const aqi = calculateAQI(pm25Value);

    results.push({
      province: 'Bangkok',
      district: district.name,
      aqi,
      pm25: pm25Value,
      category: getAirCategory(aqi),
      measured_at: makeTimestamp(current?.time),
    });
  }

  return results;
}

function resolveDistrictInfo(district: string) {
  const match = bangkokDistricts.find(
    (item) => item.name.toLowerCase() === district.toLowerCase()
  );

  if (!match) {
    throw new ValidationError(`District "${district}" is not supported`);
  }

  return match;
}

async function getDistrictDetail(district: string): Promise<DistrictDetail> {
  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const baseUrl = process.env.G05_OPEN_METEO_BASE_URL;
  if (!baseUrl) {
    throw new CleanAirConfigurationError(
      'OPEN_METEO_BASE_URL is not configured'
    );
  }

  const districtInfo = resolveDistrictInfo(district);
  const current = await fetchCurrentAirQuality(
    baseUrl,
    districtInfo.lat,
    districtInfo.lng,
    DETAIL_CURRENT_PARAMS
  );

  const pm25Value = makeSafeNumber(current?.pm2_5);
  const aqi = calculateAQI(pm25Value);

  return {
    district: districtInfo.name.toLowerCase(),
    currentData: {
      aqi,
      pm25: pm25Value,
      pm10: makeSafeNumber(current?.pm10),
      co: Number(makeSafeNumber(current?.carbon_monoxide).toFixed(1)),
      no2: Number(makeSafeNumber(current?.nitrogen_dioxide).toFixed(1)),
      so2: Number(makeSafeNumber(current?.sulphur_dioxide).toFixed(1)),
      o3: Number(makeSafeNumber(current?.ozone).toFixed(1)),
      category: getAirCategory(aqi),
      measured_at: makeTimestamp(current?.time),
    },
    address: {
      province: 'Bangkok',
      district: districtInfo.name,
    },
    coordinates: {
      lat: districtInfo.lat,
      lng: districtInfo.lng,
    },
  };
}

async function getDistrictHistory(district: string): Promise<DistrictHistory> {
  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const baseUrl = process.env.G05_OPEN_METEO_BASE_URL;
  if (!baseUrl) {
    throw new CleanAirConfigurationError(
      'OPEN_METEO_BASE_URL is not configured'
    );
  }

  const districtInfo = resolveDistrictInfo(district);
  const hourly = await fetchHourlyAirQuality(
    baseUrl,
    districtInfo.lat,
    districtInfo.lng
  );
  const history = aggregateHourlyHistory(hourly, HISTORY_PAST_DAYS);

  if (history.length === 0) {
    throw new CleanAirProviderError(
      'No historical data available from Open Meteo',
      'open-meteo'
    );
  }

  return {
    district: districtInfo.name.toLowerCase(),
    period: `${history.length} days`,
    history,
  };
}

async function getDistrictSummary(district: string): Promise<DistrictSummary> {
  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const baseUrl = process.env.G05_OPEN_METEO_BASE_URL;
  if (!baseUrl) {
    throw new CleanAirConfigurationError(
      'OPEN_METEO_BASE_URL is not configured'
    );
  }

  const districtInfo = resolveDistrictInfo(district);
  const hourly = await fetchHourlyAirQuality(
    baseUrl,
    districtInfo.lat,
    districtInfo.lng
  );
  const history = aggregateHourlyHistory(hourly, HISTORY_PAST_DAYS);

  if (history.length === 0) {
    throw new CleanAirProviderError(
      'No historical data available from Open Meteo',
      'open-meteo'
    );
  }

  const aqiValues: number[] = [];
  const pm25Values: number[] = [];
  const pm10Values: number[] = [];

  for (let i = 0; i < history.length; i += 1) {
    const item = history[i];
    aqiValues.push(item.aqi);
    pm25Values.push(item.pm25);
    pm10Values.push(item.pm10);
  }

  const sumNumbers = (values: number[]) =>
    values.reduce((acc, value) => acc + value, 0);
  const average = {
    aqi: Math.round(sumNumbers(aqiValues) / aqiValues.length),
    pm25: Number((sumNumbers(pm25Values) / pm25Values.length).toFixed(1)),
    pm10: Number((sumNumbers(pm10Values) / pm10Values.length).toFixed(1)),
  };

  const maximum = {
    aqi: Math.max(...aqiValues),
    pm25: Math.max(...pm25Values),
    pm10: Math.max(...pm10Values),
  };

  const minimum = {
    aqi: Math.min(...aqiValues),
    pm25: Math.min(...pm25Values),
    pm10: Math.min(...pm10Values),
  };

  const latestAqi = aqiValues[0];
  const oldestAqi = aqiValues[aqiValues.length - 1];
  const aqiChange = latestAqi - oldestAqi;

  let description = 'No change';
  if (aqiChange > 5) description = 'Getting worse';
  else if (aqiChange < -5) description = 'Slightly improved';
  else if (aqiChange > 0) description = 'Slight increase';
  else if (aqiChange < 0) description = 'Slight decrease';

  return {
    district: districtInfo.name.toLowerCase(),
    period: `${history.length} days`,
    summary: {
      average,
      maximum,
      minimum,
      trend: {
        aqi_change: aqiChange,
        description,
      },
    },
  };
}

async function searchDistricts(
  query: SearchDistrictQuery
): Promise<DistrictAirQuality[]> {
  if (!query || !query.q) {
    throw new ValidationError('Search query is required');
  }

  const searchText = query.q.toLowerCase();
  const districts = await getDistricts();

  const matched: DistrictAirQuality[] = [];

  for (let i = 0; i < districts.length; i += 1) {
    const item = districts[i];
    if (item.district.toLowerCase().includes(searchText)) {
      matched.push(item);
    }
    if (matched.length === 10) {
      break;
    }
  }

  return matched;
}

async function getHealthTips(district: string): Promise<string[]> {
  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const apiKey = process.env.G05_GEMINI_API_KEY;
  if (!apiKey) {
    throw new CleanAirConfigurationError('GEMINI_API_KEY is not configured');
  }

  const modelName = process.env.G05_GEMINI_MODEL;
  if (!modelName) {
    throw new CleanAirConfigurationError('GEMINI_MODEL is not configured');
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const detail = await getDistrictDetail(district);
    const current = detail.currentData;

    const prompt = [
      `You are a public-health assistant.`,
      `Current air data for ${detail.address.district}, Bangkok:`,
      `AQI: ${current.aqi}`,
      `PM2.5: ${current.pm25} µg/m³`,
      `PM10: ${current.pm10} µg/m³`,
      `CO: ${current.co} ppm`,
      `NO2: ${current.no2} ppm`,
      `SO2: ${current.so2} ppm`,
      `O3: ${current.o3} ppm`,
      `Category: ${current.category}`,
      `Measured at: ${current.measured_at}`,
      `Provide exactly three short English bullet tips (max 20 words each) that help people stay healthy with the current air quality.`,
      `Keep the tone practical and friendly.`,
      `Return only the three bullet tips with no introductory or closing sentences.`,
    ].join('\n');

    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const raw = await response.text();

    if (!response.ok) {
      throw new CleanAirConfigurationError(
        `Gemini request failed (${response.status}): ${raw}`
      );
    }

    let lines: string[] = [];

    try {
      const parsed = JSON.parse(raw) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };

      const combinedText =
        parsed.candidates
          ?.flatMap((candidate) => candidate.content?.parts ?? [])
          .map((part) => part.text?.trim())
          .filter((text): text is string => Boolean(text))
          .join('\n') ?? '';

      lines = combinedText
        .split(/\r?\n|•|\*|-/)
        .map((line) => line.replace(/^[\s\d.:-]+/, '').trim())
        .filter(Boolean);
    } catch {
      lines = raw
        .split('\n')
        .map((line) => line.replace(/^[\s\d.:-]+/, '').trim())
        .filter(Boolean);
    }

    lines = lines.slice(0, 3);

    if (lines.length === 0) {
      return [
        'Check the AQI app and limit outdoor activity when the index rises.',
        'Wear a well-fitted mask if you must commute outside.',
        'Hydrate often and keep indoor air clean with a purifier.',
      ];
    }

    while (lines.length < 3) {
      lines.push(
        'Keep monitoring local air reports and adjust your plans accordingly.'
      );
    }

    return lines;
  } catch (error) {
    console.log('getHealthTips error', error);
    return [
      'Review the latest AQI and plan outdoor activities for lower pollution hours.',
      'Use an air purifier indoors and ventilate when outdoor air improves.',
      'Stay hydrated and seek medical advice if breathing issues appear.',
    ];
  }
}

export {
  getDistricts,
  getDistrictDetail,
  getDistrictHistory,
  getDistrictSummary,
  getHealthTips,
  searchDistricts,
};
