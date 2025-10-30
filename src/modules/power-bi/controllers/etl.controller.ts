import type { Context } from 'hono';
import { ETLService } from '../services';
import { successResponse } from '@/utils/response';

// Extraction
const getUserData = async (c: Context) => {
  const data = await ETLService.getUserData();
  return successResponse(c, data);
};

const getHealthcareData = async (c: Context) => {
  const data = await ETLService.getHealthcareData();
  return successResponse(c, data);
};

const getWeatherData = async (c: Context) => {
  const data = await ETLService.getWeatherData();
  return successResponse(c, data);
};

const getWasteData = async (c: Context) => {
  const data = await ETLService.getWasteData();
  return successResponse(c, data);
};

// Transformation
const transformWeatherData = async (c: Context) => {
  const data = await ETLService.transformWeatherData(
    await ETLService.getWeatherData()
  );
  return successResponse(c, data);
};

// Loading
const loadWeatherDataToG7FBDB = async (c: Context) => {
  const serviceAccountPath = process.env.G7_SERVICE_ACCOUNT_PATH;
  const databaseUrl = process.env.G7_DATABASE_URL;

  if (!serviceAccountPath) {
    return c.json(
      { error: 'G7_SERVICE_ACCOUNT_PATH environment variable is required' },
      400
    );
  }

  if (!databaseUrl) {
    return c.json(
      { error: 'G7_DATABASE_URL environment variable is required' },
      400
    );
  }

  const result = await ETLService.loadWeatherDataToG7FBDB(
    await ETLService.transformWeatherData(await ETLService.getWeatherData()),
    serviceAccountPath,
    databaseUrl
  );
  return successResponse(c, { result });
};

export {
  getUserData,
  getHealthcareData,
  getWeatherData,
  getWasteData,
  transformWeatherData,
  loadWeatherDataToG7FBDB,
};
