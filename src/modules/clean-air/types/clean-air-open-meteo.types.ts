export interface DistrictAirQuality {
  province: string;
  district: string;
  aqi: number;
  pm25: number;
  category: AirQualityCategory;
  measured_at: string;
}

export interface DistrictDetailData {
  aqi: number;
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
  category: AirQualityCategory;
  measured_at: string;
}

export interface DistrictDetail {
  district: string;
  currentData: DistrictDetailData;
  address: {
    province: string;
    district: string;
  };
  coordinates: { lat: number; lng: number };
}

export interface DistrictHistory {
  district: string;
  period: string;
  history: DistrictDetailData[];
}

export interface DistrictSummary {
  district: string;
  period: string;
  summary: {
    average: {
      aqi: number;
      pm25: number;
      pm10: number;
    };
    maximum: {
      aqi: number;
      pm25: number;
      pm10: number;
    };
    minimum: {
      aqi: number;
      pm25: number;
      pm10: number;
    };
    trend: {
      aqi_change: number;
      description: string;
    };
  };
}

export type AirQualityCategory =
  | 'GOOD'
  | 'MODERATE'
  | 'UNHEALTHY_FOR_SENSITIVE'
  | 'UNHEALTHY'
  | 'VERY_UNHEALTHY'
  | 'HAZARDOUS';

export interface SearchDistrictQuery {
  q: string;
}

export interface CleanAirService {
  getDistricts(): Promise<DistrictAirQuality[]>;
  getDistrictDetail(district: string): Promise<DistrictDetail>;
  getDistrictHistory(district: string): Promise<DistrictHistory>;
  getDistrictSummary(district: string): Promise<DistrictSummary>;
  getHealthTips(district: string): Promise<string[]>;
  searchDistricts(query: SearchDistrictQuery): Promise<DistrictAirQuality[]>;
}
