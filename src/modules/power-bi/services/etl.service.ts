import { ETLModel } from '../models';
import type {
  ExtractedUserData,
  ExtractedHealthcareData,
  ExtractedWeatherData,
  ExtractedWasteData,
} from '../types';
import type { addresses } from '@/generated/prisma';
import { NotFoundError } from '@/errors';

// ============================================================================
// Extract Functions
// ============================================================================

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

// ============================================================================
// Exports
// ============================================================================

export {
  getUserData,
  getHealthcareData,
  getWeatherData,
  getWasteData,
  getAddressesForHealthcare,
};
