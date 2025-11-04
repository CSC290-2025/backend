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

export { getUserData, getHealthcareData, getWeatherData, getWasteData };
