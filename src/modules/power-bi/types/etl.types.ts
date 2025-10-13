import type {
  Roles,
  Departments,
  Specialty,
  Addresses,
  Users,
  User_profiles,
  Users_departments,
  Air_quality,
  Weather_data,
  Patients,
  Facilities,
  Beds,
  Appointments,
  Prescriptions,
  Ambulances,
  Emergency_calls,
  Payments,
  Team_integrations,
  Waste_types,
  Waste_event_statistics,
  Power_bi_reports,
  Prisma,
} from '@/generated/prisma';

type ExtractedData = {
  roles: Roles[];
  departments: Departments[];
  specialties: Specialty[];
  addresses: Addresses[];
  users: Users[];
  userProfiles: User_profiles[];
  usersDepartments: Users_departments[];
  airQuality: Air_quality[];
  weatherData: Weather_data[];
  patients: Patients[];
  facilities: Facilities[];
  beds: Beds[];
  appointments: Appointments[];
  prescriptions: Prescriptions[];
  ambulances: Ambulances[];
  emergencyCalls: Emergency_calls[];
  payments: Payments[];
  teamIntegrations: Team_integrations[];
  wasteTypes: Waste_types[];
  wasteEventStatistics: Waste_event_statistics[];
  powerBiReports: Power_bi_reports[];
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
