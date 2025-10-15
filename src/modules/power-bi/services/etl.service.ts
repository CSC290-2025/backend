import { ETLModel } from '../models';
import type {
  ExtractedData,
  ExtractedUserData,
  ExtractedHealthcareData,
  ExtractedWeatherData,
  ExtractedWasteData,
  FactWeather,
  DimLocation,
} from '../types';
import { NotFoundError, ValidationError } from '@/errors';
import fs from 'fs';
import admin from 'firebase-admin';

const getExtractedData = async (): Promise<ExtractedData> => {
  const data = await ETLModel.extractAllData();
  if (!data) throw new NotFoundError('No data found');
  return data;
};

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
    if (!airQualityByLocation[locId]) airQualityByLocation[locId] = [] as any;
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

  // Load dimLocations
  console.log(
    `Loading ${data.dimLocations.length} dimLocations to Firebase...`
  );
  const dimLocationsRef = db.ref('dim_locations');
  for (const loc of data.dimLocations) {
    // Convert to snake_case for Firebase
    const location = {
      id: loc.id,
      district: loc.district,
      coordinates: loc.coordinates,
    };
    await dimLocationsRef.child(loc.id.toString()).set(location);
    console.log(`Loaded dimLocation ID: ${loc.id}`);
  }

  // Load factWeather
  console.log(
    `Loading ${data.factWeather.length} factWeather records to Firebase...`
  );
  const factWeatherRef = db.ref('fact_weather');
  for (const fw of data.factWeather) {
    const weather = {
      id: fw.id,
      time_id: fw.timeId,
      location_id: fw.locationId,
      avg_aqi: fw.avgAqi,
      max_pm25: fw.maxPm25,
      avg_temperature: fw.avgTemperatureC,
    };
    await factWeatherRef.child(fw.id.toString()).set(weather);
    console.log(`Loaded factWeather ID: ${fw.id}`);
  }

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

const getTeamIntegrations = async (): Promise<ExtractedTeamIntegrations> => {
  const data = await ETLModel.extractTeamIntegrations();
  if (!data) throw new NotFoundError('No team integrations data found');
  return data;
};

export {
  getExtractedData,
  getUserData,
  getHealthcareData,
  getWeatherData,
  getWasteData,
  getTeamIntegrations,
  transformWeatherData,
  loadWeatherDataToG7FBDB,
};
