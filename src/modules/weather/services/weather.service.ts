import { WeatherModel } from '../models';
import type { WeatherData } from '../types';
import { NotFoundError, ValidationError } from '@/errors';

const validateDateFormat = (date: string): void => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError('Invalid date format. Use YYYY-MM-DD');
  }
};

const getWeatherByDate = async (date: string): Promise<WeatherData[]> => {
  validateDateFormat(date);
  return await WeatherModel.findByDate(date);
};

const listWeatherByDateRange = async (
  fromDate: string,
  toDate: string
): Promise<WeatherData[]> => {
  validateDateFormat(fromDate);
  validateDateFormat(toDate);

  if (fromDate > toDate) {
    throw new ValidationError('fromDate must be before or equal to toDate');
  }

  return await WeatherModel.findByDateRange(fromDate, toDate);
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

const deleteWeatherByDate = async (
  date: string
): Promise<{ deleted: number }> => {
  validateDateFormat(date);
  const count = await WeatherModel.deleteByDate(date);
  if (count === 0) {
    throw new NotFoundError('No weather data found for the given date');
  }
  return { deleted: count };
};

const deleteAllWeather = async (): Promise<{ deleted: number }> => {
  const count = await WeatherModel.deleteAll();
  return { deleted: count };
};

export {
  getWeatherByDate,
  listWeatherByDateRange,
  listWeather,
  listWeatherByLocation,
  deleteWeatherByDate,
  deleteAllWeather,
};
