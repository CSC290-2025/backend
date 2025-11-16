import type { AirQualityCategory } from './clean-air-open-meteo.types';

export interface Air4ThaiAQIValue {
  color_id?: string;
  aqi?: string;
  value?: string;
  param?: string;
}

export interface Air4ThaiStation {
  stationID?: string;
  stationType?: string;
  nameTH?: string;
  nameEN?: string;
  stationNameTH?: string;
  stationNameEN?: string;
  areaTH?: string;
  areaEN?: string;
  lat?: string;
  long?: string;
  forecast?: unknown;
  AQILast?: {
    date?: string;
    time?: string;
    PM25?: Air4ThaiAQIValue | null;
    PM10?: Air4ThaiAQIValue | null;
    O3?: Air4ThaiAQIValue | null;
    CO?: Air4ThaiAQIValue | null;
    NO2?: Air4ThaiAQIValue | null;
    SO2?: Air4ThaiAQIValue | null;
    AQI?: Air4ThaiAQIValue | null;
  } | null;
}

export interface Air4ThaiApiResponse {
  stations?: Air4ThaiStation[];
  Station?: Air4ThaiStation[];
}

export interface Air4ThaiDistrictAirQuality {
  district: string;
  province: string;
  aqi: number;
  pm25: number;
  category: AirQualityCategory;
  measured_at: string;
}

export interface Air4ThaiService {
  getBangkokDistrictAQI(): Promise<Air4ThaiDistrictAirQuality[]>;
}
