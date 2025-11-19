import { WeatherModel } from '../models';
import type {
  WeatherData,
  CreateWeatherData,
  UpdateWeatherData,
} from '../types';
import { NotFoundError, ValidationError } from '@/errors';

const toNumberId = (id: string): number => {
  const num = Number(id);
  if (Number.isNaN(num)) {
    throw new ValidationError('Invalid weather id');
  }
  return num;
};

const getWeatherById = async (id: string): Promise<WeatherData> => {
  const numId = toNumberId(id);
  const weather = await WeatherModel.findById(numId);
  if (!weather) {
    throw new NotFoundError('Weather data not found');
  }
  return weather;
};

const listWeather = async (): Promise<WeatherData[]> => {
  return await WeatherModel.findAll();
};

const listWeatherByLocation = async (
  locationId: string | number
): Promise<WeatherData[]> => {
  const numLoc =
    typeof locationId === 'string' ? Number(locationId) : locationId;
  if (Number.isNaN(numLoc)) {
    throw new ValidationError('Invalid location id');
  }
  return await WeatherModel.findByLocationId(numLoc);
};

const createWeather = async (data: CreateWeatherData): Promise<WeatherData> => {
  if (data.location_id == null) {
    throw new ValidationError('location_id is required');
  }
  return await WeatherModel.create(data);
};

const updateWeather = async (
  id: string,
  data: UpdateWeatherData
): Promise<WeatherData> => {
  const numId = toNumberId(id);

  const existing = await WeatherModel.findById(numId);
  if (!existing) {
    throw new NotFoundError('Weather data not found');
  }

  return await WeatherModel.update(numId, data);
};

const deleteWeather = async (id: string): Promise<void> => {
  const numId = toNumberId(id);

  const existing = await WeatherModel.findById(numId);
  if (!existing) {
    throw new NotFoundError('Weather data not found');
  }

  await WeatherModel.deleteById(numId);
};

const deleteAllWeather = async (): Promise<{ deleted: number }> => {
  const count = await WeatherModel.deleteAll();
  return { deleted: count };
};

export {
  getWeatherById,
  listWeather,
  listWeatherByLocation,
  createWeather,
  updateWeather,
  deleteWeather,
  deleteAllWeather,
};
