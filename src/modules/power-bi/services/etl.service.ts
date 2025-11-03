import { ETLModel } from '../models';
import type {
  ExtractedUserData,
  ExtractedHealthcareData,
  ExtractedWeatherData,
  ExtractedWasteData,
  FactWeather,
  FactHealthcare,
  DimLocation,
  DimTime,
  DimFacility,
} from '../types';
import type { addresses } from '@/generated/prisma';
import { NotFoundError, ValidationError } from '@/errors';
import fs from 'fs';
import admin from 'firebase-admin';

const transformWeatherData = async ({
  airQuality,
  weatherData,
}: ExtractedWeatherData): Promise<{
  dimLocations: DimLocation[];
  factWeather: FactWeather[];
}> => {
  if (
    !weatherData ||
    !airQuality ||
    weatherData.length === 0 ||
    airQuality.length === 0
  ) {
    throw new ValidationError('No weather data available for transformation');
  }

  // Build dim location entries from unique location_ids in airQuality and weatherData
  const dimLocationMap: Record<number, DimLocation> = {};
  const airQualityByLocation: Record<number, typeof airQuality> = {}; // to aggregate airQuality entries by location_id

  airQuality.forEach((entry) => {
    const locId = Number(entry.location_id);
    // Ensure airQuality locations are included
    if (!dimLocationMap[locId]) {
      dimLocationMap[locId] = {
        id: locId,
        district: '',
        coordinates: null as unknown as Geolocation,
      };
    }
    // Aggregate airQuality entries by location_id
    if (!airQualityByLocation[locId])
      airQualityByLocation[locId] = [] as unknown as typeof airQuality;
    airQualityByLocation[locId].push(entry);
  });

  // Ensure weatherData locations are included
  weatherData.forEach((entry) => {
    const locId = Number(entry.location_id);
    if (!dimLocationMap[locId]) {
      dimLocationMap[locId] = {
        id: locId,
        district: '',
        coordinates: null as unknown as Geolocation,
      };
    }
  });

  const dimLocations = Object.values(dimLocationMap).sort(
    (a, b) => a.id - b.id
  );

  // Build fact weather rows by joining weatherData with aggregated airQuality per location
  // Simplistically compute avg aqi and max pm25 per location using airQuality entries with same location_id

  const factWeather: FactWeather[] = weatherData
    .map((wd) => {
      const locId = Number(wd.location_id);
      const aqiEntries = airQualityByLocation[locId] || [];

      // parse numeric values (source DB stores numbers as strings in sample payload)
      const aqiValues = aqiEntries
        .map((a) => Number(a.aqi))
        .filter((n) => !Number.isNaN(n));
      const pm25Values = aqiEntries
        .map((a) => Number(a.pm25))
        .filter((n) => !Number.isNaN(n));

      console.log('AQI Values: ', aqiValues);
      const avgAqi =
        aqiValues.length > 0
          ? aqiValues.reduce((s, v) => s + v, 0) / aqiValues.length
          : null;
      console.log('Avg AQI: ', avgAqi);
      const maxPm25 = pm25Values.length > 0 ? Math.max(...pm25Values) : null;

      const avgTemp = Number(wd.temperature);

      const record: FactWeather = {
        id: Number(wd.id),
        timeId: (wd as any).time_id ?? null,
        locationId: locId,
        avgAqi: avgAqi ?? 0,
        maxPm25: maxPm25 ?? 0,
        avgTemperatureC: Number.isNaN(avgTemp) ? 0 : avgTemp,
      };

      return record;
    })
    .sort((a, b) => a.id - b.id);

  return { dimLocations, factWeather };
};

const loadWeatherDataToG7FBDB = async (
  data: { dimLocations: DimLocation[]; factWeather: FactWeather[] },
  serviceAccountPath: string,
  dbUrl: string
) => {
  if (!data || !data.dimLocations || !data.factWeather) {
    throw new ValidationError('No data provided for loading');
  }
  if (!fs.existsSync(serviceAccountPath)) {
    throw new ValidationError('Service account file not found at path');
  }
  if (!dbUrl) {
    throw new ValidationError('Database URL is required for loading data');
  }
  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, 'utf-8')
  );
  console.log('ServiceAccount: ', serviceAccount);

  // Initialize Firebase Admin SDK
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: dbUrl,
    });
  }
  const db = admin.database();

  // Load dim_location - Store as array for Power BI compatibility (singular to match Prisma schema)
  console.log(
    `Loading ${data.dimLocations.length} dimLocations to Firebase...`
  );
  const dimLocationRef = db.ref('dim_location');
  const dimLocationArray = data.dimLocations.map((loc) => ({
    location_id: loc.id,
    district: loc.district || '',
    coordinates: loc.coordinates,
  }));
  await dimLocationRef.set(dimLocationArray);
  console.log(
    `Loaded ${dimLocationArray.length} dim_location records to Firebase`
  );

  // Load fact_weather - Store as array for Power BI compatibility (matches Prisma schema)
  console.log(
    `Loading ${data.factWeather.length} factWeather records to Firebase...`
  );
  const factWeatherRef = db.ref('fact_weather');
  const factWeatherArray = data.factWeather.map((fw) => ({
    weather_id: fw.id,
    time_id: fw.timeId,
    location_id: fw.locationId,
    avg_aqi_numeric: fw.avgAqi,
    max_pm25_numeric: fw.maxPm25,
    avg_temperature_numeric: fw.avgTemperatureC,
  }));
  await factWeatherRef.set(factWeatherArray);
  console.log(
    `Loaded ${factWeatherArray.length} fact_weather records to Firebase`
  );

  console.log('Data loading to G7FBDB completed successfully.');
};

const getUserData = async (): Promise<ExtractedUserData> => {
  const data = await ETLModel.extractUserData();
  if (!data) throw new NotFoundError('No user data found');
  return data;
};

const getHealthcareData = async (): Promise<ExtractedHealthcareData> => {
  const data = await ETLModel.extractHealthcareData();
  if (!data) throw new NotFoundError('No healthcare data found');
  return data;
};

const getWeatherData = async (): Promise<ExtractedWeatherData> => {
  const data = await ETLModel.extractWeatherData();
  if (!data) throw new NotFoundError('No weather data found');
  return data;
};

const getWasteData = async (): Promise<ExtractedWasteData> => {
  const data = await ETLModel.extractWasteData();
  if (!data) throw new NotFoundError('No waste data found');
  return data;
};

const getAddressesForHealthcare = async (): Promise<addresses[]> => {
  const data = await ETLModel.extractAddressesForHealthcare();
  if (!data) throw new NotFoundError('No addresses found');
  return data;
};

// Helper function to create time dimension from date
const createTimeDimension = (date: Date): DimTime => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const week = Math.ceil(day / 7);
  const quarter = Math.ceil(month / 3);
  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const weekday = weekdays[date.getDay()];

  // Generate a unique time ID based on date (YYYYMMDD format)
  const timeId = parseInt(
    `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`
  );

  return {
    id: timeId,
    date,
    day,
    month,
    year,
    quarter,
    week,
    weekday,
  };
};

// Helper function to get time ID from date
const getTimeIdFromDate = (date: Date | null | undefined): number | null => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return parseInt(
    `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`
  );
};

const transformHealthcareData = async (
  healthcareData: ExtractedHealthcareData,
  addresses: addresses[]
): Promise<{
  dimTimes: DimTime[];
  dimLocations: DimLocation[];
  dimFacilities: DimFacility[];
  factHealthcare: FactHealthcare[];
}> => {
  if (
    !healthcareData ||
    !healthcareData.facilities ||
    healthcareData.facilities.length === 0
  ) {
    throw new ValidationError(
      'No healthcare data available for transformation'
    );
  }

  // Build DimTime from all dates in healthcare data
  const timeSet = new Set<string>();
  const timeMap: Record<string, DimTime> = {};

  // Collect dates from appointments
  healthcareData.appointments.forEach((apt) => {
    if (apt.appointment_at) {
      const date = new Date(apt.appointment_at);
      const dateKey = date.toISOString().split('T')[0];
      if (!timeSet.has(dateKey)) {
        timeSet.add(dateKey);
        const dimTime = createTimeDimension(date);
        timeMap[dimTime.id] = dimTime;
      }
    }
  });

  // Collect dates from payments
  healthcareData.payments.forEach((payment) => {
    if (payment.payment_date) {
      const date = new Date(payment.payment_date);
      const dateKey = date.toISOString().split('T')[0];
      if (!timeSet.has(dateKey)) {
        timeSet.add(dateKey);
        const dimTime = createTimeDimension(date);
        timeMap[dimTime.id] = dimTime;
      }
    }
  });

  const dimTimes = Object.values(timeMap).sort((a, b) => a.id - b.id);

  // Build DimLocation from unique addresses used by facilities
  const locationMap: Record<number, DimLocation> = {};
  const addressMap = new Map(addresses.map((addr) => [addr.id, addr]));

  healthcareData.facilities.forEach((facility) => {
    if (facility.address_id) {
      const address = addressMap.get(facility.address_id);
      if (address && !locationMap[address.id]) {
        locationMap[address.id] = {
          id: address.id,
          district: address.district || '',
          coordinates: null as unknown as Geolocation, // Address might have geometry
        };
      }
    }
  });

  const dimLocations = Object.values(locationMap).sort((a, b) => a.id - b.id);

  // Build DimFacility
  const dimFacilities: DimFacility[] = healthcareData.facilities
    .map((facility) => ({
      id: facility.id,
      facilityId: facility.id,
      locationId: facility.address_id || 0,
    }))
    .sort((a, b) => a.id - b.id);

  // Build FactHealthcare by aggregating metrics per facility per time
  const factMap: Record<string, FactHealthcare> = {};

  // Group appointments by facility and time
  const appointmentsByFacilityTime: Record<
    string,
    typeof healthcareData.appointments
  > = {};
  healthcareData.appointments.forEach((apt) => {
    if (apt.facility_id && apt.appointment_at) {
      const timeId = getTimeIdFromDate(apt.appointment_at);
      if (timeId) {
        const key = `${apt.facility_id}-${timeId}`;
        if (!appointmentsByFacilityTime[key]) {
          appointmentsByFacilityTime[key] = [];
        }
        appointmentsByFacilityTime[key].push(apt);
      }
    }
  });

  // Group beds by facility
  const bedsByFacility: Record<number, typeof healthcareData.beds> = {};
  healthcareData.beds.forEach((bed) => {
    if (bed.facility_id) {
      if (!bedsByFacility[bed.facility_id]) {
        bedsByFacility[bed.facility_id] = [];
      }
      bedsByFacility[bed.facility_id].push(bed);
    }
  });

  // Group payments by facility and time
  const paymentsByFacilityTime: Record<string, typeof healthcareData.payments> =
    {};
  healthcareData.payments.forEach((payment) => {
    if (payment.facility_id && payment.payment_date) {
      const timeId = getTimeIdFromDate(payment.payment_date);
      if (timeId) {
        const key = `${payment.facility_id}-${timeId}`;
        if (!paymentsByFacilityTime[key]) {
          paymentsByFacilityTime[key] = [];
        }
        paymentsByFacilityTime[key].push(payment);
      }
    }
  });

  // Calculate wait time (simplified: assume average based on appointment times)
  const calculateWaitTime = (
    appointments: typeof healthcareData.appointments
  ): number => {
    if (appointments.length === 0) return 0;
    // Simplified calculation - in reality, wait time would be from check-in to consultation
    return 30; // Default 30 minutes average wait time
  };

  // Build FactHealthcare records
  let factId = 1;
  healthcareData.facilities.forEach((facility) => {
    dimTimes.forEach((dimTime) => {
      const key = `${facility.id}-${dimTime.id}`;
      const facilityAppointments = appointmentsByFacilityTime[key] || [];
      const facilityPayments = paymentsByFacilityTime[key] || [];
      const facilityBeds = bedsByFacility[facility.id] || [];

      const occupiedBeds = facilityBeds.filter(
        (bed) => bed.status === 'occupied'
      ).length;
      const totalBeds = facilityBeds.length;
      const bedOccupancyPercent =
        totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

      const totalRevenue = facilityPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

      const avgWaitTimeMinutes = calculateWaitTime(facilityAppointments);
      const patientCount = new Set(
        facilityAppointments.map((apt) => apt.patient_id)
      ).size;

      factMap[key] = {
        id: factId++,
        timeId: dimTime.id,
        facilityId: facility.id,
        avgWaitTimeMinutes,
        patientCount,
        bedOccupancyPercent,
        totalRevenue,
      };
    });
  });

  const factHealthcare = Object.values(factMap).sort((a, b) => a.id - b.id);

  return {
    dimTimes,
    dimLocations,
    dimFacilities,
    factHealthcare,
  };
};

const loadHealthcareDataToG7FBDB = async (
  data: {
    dimTimes: DimTime[];
    dimLocations: DimLocation[];
    dimFacilities: DimFacility[];
    factHealthcare: FactHealthcare[];
  },
  serviceAccountPath: string,
  dbUrl: string
) => {
  if (
    !data ||
    !data.dimTimes ||
    !data.dimLocations ||
    !data.dimFacilities ||
    !data.factHealthcare
  ) {
    throw new ValidationError('No data provided for loading');
  }
  if (!fs.existsSync(serviceAccountPath)) {
    throw new ValidationError('Service account file not found at path');
  }
  if (!dbUrl) {
    throw new ValidationError('Database URL is required for loading data');
  }

  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, 'utf-8')
  );

  // Initialize Firebase Admin SDK
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: dbUrl,
    });
  }
  const db = admin.database();

  // Load dim_time - Store as array for Power BI compatibility (singular to match Prisma schema)
  console.log(`Loading ${data.dimTimes.length} dimTimes to Firebase...`);
  const dimTimeRef = db.ref('dim_time');
  const dimTimeArray = data.dimTimes.map((dimTime) => ({
    time_id: dimTime.id,
    date_actual: dimTime.date.toISOString().split('T')[0],
    year_val: dimTime.year,
    month_val: dimTime.month,
    day_val: dimTime.day,
    quarter_val: dimTime.quarter,
    week_val: dimTime.week,
    weekday: dimTime.weekday,
  }));
  await dimTimeRef.set(dimTimeArray);
  console.log(`Loaded ${dimTimeArray.length} dim_time records to Firebase`);

  // Load dim_location - Store as array for Power BI compatibility (singular to match Prisma schema)
  console.log(
    `Loading ${data.dimLocations.length} dimLocations to Firebase...`
  );
  const dimLocationRef = db.ref('dim_location');
  const dimLocationArray = data.dimLocations.map((loc) => ({
    location_id: loc.id,
    district: loc.district || '',
    coordinates: loc.coordinates,
  }));
  await dimLocationRef.set(dimLocationArray);
  console.log(
    `Loaded ${dimLocationArray.length} dim_location records to Firebase`
  );

  // Load dim_facility - Store as array for Power BI compatibility (singular to match Prisma schema)
  console.log(
    `Loading ${data.dimFacilities.length} dimFacilities to Firebase...`
  );
  const dimFacilityRef = db.ref('dim_facility');
  const dimFacilityArray = data.dimFacilities.map((facility) => ({
    facility_id: facility.facilityId,
    location_id: facility.locationId,
  }));
  await dimFacilityRef.set(dimFacilityArray);
  console.log(
    `Loaded ${dimFacilityArray.length} dim_facility records to Firebase`
  );

  // Load FactHealthcare - Store as array for Power BI compatibility
  console.log(
    `Loading ${data.factHealthcare.length} factHealthcare records to Firebase...`
  );
  const factHealthcareRef = db.ref('fact_healthcare');
  const factHealthcareArray = data.factHealthcare.map((fh) => ({
    health_id: fh.id,
    time_id: fh.timeId,
    facility_id: fh.facilityId,
    avg_wait_time_minutes_numeric: fh.avgWaitTimeMinutes,
    patient_count: fh.patientCount,
    bed_occupancy_percent_numeric: fh.bedOccupancyPercent,
    total_revenue_numeric: fh.totalRevenue,
  }));
  await factHealthcareRef.set(factHealthcareArray);
  console.log(
    `Loaded ${factHealthcareArray.length} factHealthcare records to Firebase`
  );

  console.log('Healthcare data loading to G7FBDB completed successfully.');
};

export {
  getUserData,
  getHealthcareData,
  getWeatherData,
  getWasteData,
  getAddressesForHealthcare,
  transformWeatherData,
  loadWeatherDataToG7FBDB,
  transformHealthcareData,
  loadHealthcareDataToG7FBDB,
};
