import { WeatherModel } from '../models';
import type { WeatherData } from '../types';
import { NotFoundError, ValidationError } from '@/errors';

// Ensure a date string follows the strict YYYY-MM-DD format.
const validateDateFormat = (date: string): void => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError('Invalid date format. Use YYYY-MM-DD');
  }
};

// Fetch all weather records created on the provided date.
const getWeatherByDate = async (date: string): Promise<WeatherData[]> => {
  validateDateFormat(date);
  return await WeatherModel.findByDate(date);
};

// Fetch weather records across an inclusive date range after validation.
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

// Fetch every weather record ordered by creation date.
const listWeather = async (): Promise<WeatherData[]> => {
  return await WeatherModel.findAll();
};

// Fetch weather records filtered by a numeric location id.
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

// Delete weather records on a specific date and error if nothing was removed.
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

// Delete every row in weather_data and return the number of rows removed.
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
