import type { Context } from 'hono';
import { ETLService } from '../services';
import { successResponse } from '@/utils/response';

// Extraction
const getUserData = async (c: Context) => {
  const data = await ETLService.getUserData();
  return successResponse(c, data);
};

<<<<<<< HEAD
const getHealthcareData = async (c: Context) => {
  const data = await ETLService.getHealthcareData();
  return successResponse(c, data);
=======
const getUserData = async (c: Context) => {
  const data = await ETLService.getUserData();
  return successResponse(c, { data });
};

const getHealthcareData = async (c: Context) => {
  const data = await ETLService.getHealthcareData();
  return successResponse(c, { data });
>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
};

const getWeatherData = async (c: Context) => {
  const data = await ETLService.getWeatherData();
<<<<<<< HEAD
  return successResponse(c, data);
=======
  return successResponse(c, { data });
>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
};

const getWasteData = async (c: Context) => {
  const data = await ETLService.getWasteData();
<<<<<<< HEAD
  return successResponse(c, data);
};

// Transformation
=======
  return successResponse(c, { data });
};

const getTeamIntegrations = async (c: Context) => {
  const data = await ETLService.getTeamIntegrations();
  return successResponse(c, { data });
};

>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
const transformWeatherData = async (c: Context) => {
  const data = await ETLService.transformWeatherData(
    await ETLService.getWeatherData()
  );
  return successResponse(c, data);
};

<<<<<<< HEAD
// Loading
=======
>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
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
<<<<<<< HEAD
=======
  getExtractedData,
>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
  getUserData,
  getHealthcareData,
  getWeatherData,
  getWasteData,
<<<<<<< HEAD
=======
  getTeamIntegrations,
>>>>>>> ddf9188 (feat: implement modular ETL data extraction and fix Firebase field mapping)
  transformWeatherData,
  loadWeatherDataToG7FBDB,
};
