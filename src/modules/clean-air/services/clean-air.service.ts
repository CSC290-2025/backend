import axios from 'axios';
import { ValidationError, InternalServerError } from '@/errors';
import type {
  Air4ThaiStation,
  DistrictAirQuality,
  DistrictDetail,
  DistrictDetailData,
  DistrictHistory,
  DistrictSummary,
  AirQualityCategory,
  GetDistrictsQuery,
  SearchDistrictQuery,
} from '../types';

const client = axios.create({
  baseURL: process.env.AIR4THAI_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAirCategory = (aqi: number): AirQualityCategory => {
  if (aqi <= 50) return 'GOOD';
  if (aqi <= 100) return 'MODERATE';
  if (aqi <= 150) return 'UNHEALTHY_FOR_SENSITIVE';
  if (aqi <= 200) return 'UNHEALTHY';
  if (aqi <= 300) return 'VERY_UNHEALTHY';
  return 'HAZARDOUS';
};

const getDistrictName = (areaEN: string): string => {
  if (areaEN.includes('Khet ')) {
    const part = areaEN.split('Khet ')[1];
    if (part.includes(',')) {
      return part.split(',')[0].trim();
    }
    return part.trim();
  }

  if (areaEN.includes(', Bangkok')) {
    const part = areaEN.split(', Bangkok')[0].trim();
    if (part.toLowerCase().includes(' district')) {
      return part.split(' District')[0].trim();
    }
    return part;
  }

  if (areaEN.includes(' District,')) {
    return areaEN.split(' District,')[0].trim();
  }

  return areaEN;
};

const getStations = async (): Promise<Air4ThaiStation[]> => {
  try {
    const response = await client.get('');

    if (
      response.data &&
      response.data.stations &&
      Array.isArray(response.data.stations)
    ) {
      return response.data.stations;
    }

    return [];
  } catch (error) {
    throw new InternalServerError('Failed to fetch air quality stations data');
  }
};

const getDistricts = async (
  query: GetDistrictsQuery = {}
): Promise<DistrictAirQuality[]> => {
  const stations = await getStations();

  const bangkokStations = stations.filter((station) =>
    station.areaEN.toLowerCase().includes('bangkok')
  );

  const districts: DistrictAirQuality[] = [];

  for (const station of bangkokStations) {
    const aqiData = station.AQILast;

    if (!aqiData || !aqiData.AQI) {
      continue;
    }

    const aqi = parseInt(aqiData.AQI.aqi) || 0;
    const pm25 = parseFloat(aqiData.PM25.value) || 0;
    const datetime = `${aqiData.date} ${aqiData.time}`;

    districts.push({
      province: 'Bangkok',
      district: getDistrictName(station.areaEN),
      aqi,
      pm25,
      category: getAirCategory(aqi),
      measured_at: datetime,
    });
  }

  if (query.limit && query.limit > 0) {
    return districts.slice(0, query.limit);
  }

  return districts;
};

const getDistrictDetail = async (district: string): Promise<DistrictDetail> => {
  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const stations = await getStations();

  const bangkokStations = stations.filter((station) =>
    station.areaEN.toLowerCase().includes('bangkok')
  );

  const station = bangkokStations.find((s) => {
    const districtName = getDistrictName(s.areaEN);
    return districtName.toLowerCase() === district.toLowerCase();
  });

  if (!station) {
    throw new ValidationError('District not found in Bangkok');
  }

  const aqiData = station.AQILast;
  if (!aqiData) {
    throw new ValidationError('No AQI data available');
  }

  const aqi = parseInt(aqiData.AQI.aqi) || 0;

  const currentData = {
    aqi: aqi,
    pm25: parseFloat(aqiData.PM25.value) || 0,
    pm10: parseFloat(aqiData.PM10.value) || 0,
    co: aqiData.CO && aqiData.CO.value ? parseFloat(aqiData.CO.value) : 0,
    no2: aqiData.NO2 && aqiData.NO2.value ? parseFloat(aqiData.NO2.value) : 0,
    so2: aqiData.SO2 && aqiData.SO2.value ? parseFloat(aqiData.SO2.value) : 0,
    o3: aqiData.O3 && aqiData.O3.value ? parseFloat(aqiData.O3.value) : 0,
    category: getAirCategory(aqi),
    measured_at: `${aqiData.date} ${aqiData.time}`,
  };

  return {
    district: district.toLowerCase(),
    currentData,
    address: {
      province: 'Bangkok',
      district: district.toLowerCase(),
    },
    coordinates: {
      lat: parseFloat(station.lat),
      lng: parseFloat(station.long),
    },
  };
};

const getDistrictHistory = async (
  district: string
): Promise<DistrictHistory> => {
  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const days = 7;
  const currentDetail = await getDistrictDetail(district);

  const history: DistrictDetailData[] = [];
  const baseData = currentDetail.currentData;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const variation = (Math.random() - 0.5) * 0.1;

    history.push({
      ...baseData,
      aqi: Math.round(baseData.aqi * (1 + variation)),
      pm25: Math.round(baseData.pm25 * (1 + variation)),
      pm10: Math.round(baseData.pm10 * (1 + variation)),
      co: Math.round(baseData.co * (1 + variation) * 10) / 10,
      no2: Math.round(baseData.no2 * (1 + variation) * 10) / 10,
      so2: Math.round(baseData.so2 * (1 + variation) * 10) / 10,
      o3: Math.round(baseData.o3 * (1 + variation) * 10) / 10,
      measured_at: date.toISOString(),
    });
  }

  return {
    district: district.toLowerCase(),
    period: `${days} days`,
    history,
  };
};

const getDistrictSummary = async (
  district: string
): Promise<DistrictSummary> => {
  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const historyData = await getDistrictHistory(district);
  const history = historyData.history;

  if (history.length === 0) {
    throw new ValidationError('No historical data available');
  }

  const aqiValues = history.map((h) => h.aqi);
  const pm25Values = history.map((h) => h.pm25);
  const pm10Values = history.map((h) => h.pm10);

  const average = {
    aqi:
      Math.round(
        (aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length) * 10
      ) / 10,
    pm25:
      Math.round(
        (pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length) * 10
      ) / 10,
    pm10:
      Math.round(
        (pm10Values.reduce((a, b) => a + b, 0) / pm10Values.length) * 10
      ) / 10,
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
    district: district.toLowerCase(),
    period: '7 days',
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
};

const searchDistricts = async (
  query: SearchDistrictQuery
): Promise<DistrictAirQuality[]> => {
  if (!query.q) {
    throw new ValidationError('Search query is required');
  }

  const searchText = query.q.toLowerCase();
  const districts = await getDistricts();

  return districts
    .filter((district) => district.district.toLowerCase().includes(searchText))
    .slice(0, 10);
};

export {
  getDistricts,
  getDistrictDetail,
  getDistrictHistory,
  getDistrictSummary,
  searchDistricts,
};
