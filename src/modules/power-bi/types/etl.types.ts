import type {
  roles,
  departments,
  specialty,
  addresses,
  users,
  user_profiles,
  users_departments,
  air_quality,
  weather_data,
  patients,
  facilities,
  beds,
  appointments,
  prescriptions,
  ambulances,
  emergency_calls,
  payments,
  team_integrations,
  waste_types,
  waste_event_statistics,
  power_bi_reports,
  Prisma,
} from '@/generated/prisma';

type ExtractedData = {
  roles: roles[];
  departments: departments[];
  specialties: specialty[];
  addresses: addresses[];
  users: users[];
  userProfiles: user_profiles[];
  usersDepartments: users_departments[];
  airQuality: air_quality[];
  weatherData: weather_data[];
  patients: patients[];
  facilities: facilities[];
  beds: beds[];
  appointments: appointments[];
  prescriptions: prescriptions[];
  ambulances: ambulances[];
  emergencyCalls: emergency_calls[];
  payments: payments[];
  teamIntegrations: team_integrations[];
  wasteTypes: waste_types[];
  wasteEventStatistics: waste_event_statistics[];
  powerBiReports: power_bi_reports[];
};

type DimTime = {
  id: number;
  date: Date;
  day: number;
  month: number;
  year: number;
  quarter: number;
  week: number;
  weekday: string;
};

type DimLocation = {
  id: number;
  district: string;
  coordinates: Geolocation;
};

type DimFacility = {
  id: number;
  facilityId: number;
  locationId: number;
};

type DimWasteType = {
  id: number;
  wasteTypeId: number;
};

type DimCategory = {
  id: number;
  categoryName: string;
  categoryDescription: string | null;
};

type FactTraffic = {
  id: number;
  timeId: number;
  locationId: number;
  vehicleCount: number;
  hasAccidentFlag: boolean;
  densityLevel: string;
};

type FactWaste = {
  id: number;
  timeId: number;
  locationId: number;
  wasteTypeId: number;
  collectionWeightKg: number;
};

type FactHealthcare = {
  id: number;
  timeId: number;
  facilityId: number;
  avgWaitTimeMinutes: number;
  patientCount: number;
  bedOccupancyPercent: number;
  totalRevenue: number;
};

type FactWeather = {
  id: number;
  timeId: number;
  locationId: number;
  avgAqi: number;
  maxPm25: number;
  avgTemperatureC: number;
};

type FactPopulation = {
  id: number;
  timeId: number;
  locationId: number;
  totalPopulation: number;
  populationDensity: number;
  medianAge: number;
};

type ReportMetadata = {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  lastUpdate: Date;
  powerBiReportId: number;
};

export type {
  DimTime,
  DimLocation,
  DimFacility,
  DimWasteType,
  DimCategory,
  FactTraffic,
  FactWaste,
  FactHealthcare,
  FactWeather,
  FactPopulation,
  ReportMetadata,
  ExtractedData,
};
