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
  const serviceAccountPath = process.env.G07_SERVICE_ACCOUNT_PATH;
  const databaseUrl = process.env.G07_DATABASE_URL;

  if (!serviceAccountPath) {
    return c.json(
      { error: 'G07_SERVICE_ACCOUNT_PATH environment variable is required' },
      400
    );
  }

  if (!databaseUrl) {
    return c.json(
      { error: 'G07_DATABASE_URL environment variable is required' },
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

// Healthcare Transformation
const transformHealthcareData = async (c: Context) => {
  const healthcareData = await ETLService.getHealthcareData();
  const addresses = await ETLService.getAddressesForHealthcare();
  const data = await ETLService.transformHealthcareData(
    healthcareData,
    addresses
  );
  return successResponse(c, data);
};

// Healthcare Loading
const loadHealthcareDataToG7FBDB = async (c: Context) => {
  const serviceAccountPath = process.env.G07_SERVICE_ACCOUNT_PATH;
  const databaseUrl = process.env.G07_DATABASE_URL;

  if (!serviceAccountPath) {
    return c.json(
      { error: 'G07_SERVICE_ACCOUNT_PATH environment variable is required' },
      400
    );
  }

  if (!databaseUrl) {
    return c.json(
      { error: 'G07_DATABASE_URL environment variable is required' },
      400
    );
  }

  const healthcareData = await ETLService.getHealthcareData();
  const addresses = await ETLService.getAddressesForHealthcare();
  const transformedData = await ETLService.transformHealthcareData(
    healthcareData,
    addresses
  );

  const result = await ETLService.loadHealthcareDataToG7FBDB(
    transformedData,
    serviceAccountPath,
    databaseUrl
  );
  return successResponse(c, { result });
};

// Reports listing (metadata-driven across categories)
const getReports = async (c: Context) => {
  const reports = await ETLService.getReportsMetadata();
  return successResponse(c, { reports });
};

// Create report metadata (admin)
const createReport = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { title, description, category, embed_url, embedUrl } = body || {};
  if (!title || !category || (!embed_url && !embedUrl)) {
    return c.json(
      { error: 'title, category, and embed_url are required' },
      400
    );
  }
  const created = await ETLService.createReportMetadata({
    title,
    description,
    category,
    embed_url,
    embedUrl,
  });
  return successResponse(c, { report: created });
};

// Transformed data (from Firebase) - Weather
const getWeatherTransformedData = async (c: Context) => {
  const serviceAccountPath = process.env.G07_SERVICE_ACCOUNT_PATH;
  const databaseUrl = process.env.G07_DATABASE_URL;
  const data = await ETLService.getTransformedWeatherFromFirebase(
    databaseUrl,
    serviceAccountPath
  );
  return successResponse(c, data);
};

// Transformed data (from Firebase) - Healthcare
const getHealthcareTransformedData = async (c: Context) => {
  const serviceAccountPath = process.env.G07_SERVICE_ACCOUNT_PATH;
  const databaseUrl = process.env.G07_DATABASE_URL;
  const data = await ETLService.getTransformedHealthcareFromFirebase(
    databaseUrl,
    serviceAccountPath
  );
  return successResponse(c, data);
};

export {
  getUserData,
  getHealthcareData,
  getWeatherData,
  getWasteData,
  transformWeatherData,
  loadWeatherDataToG7FBDB,
  transformHealthcareData,
  loadHealthcareDataToG7FBDB,
  getReports,
  getWeatherTransformedData,
  getHealthcareTransformedData,
  createReport,
};
