import { WeatherModel } from '../models';
import type { WeatherData } from '../types';
import { NotFoundError, ValidationError } from '@/errors';

// Fetch all weather records created on the provided date.
const getWeatherByDate = async (date: string): Promise<WeatherData[]> => {
  return await WeatherModel.findByDate(date);
};

// Fetch weather records across an inclusive date range after validation.
const listWeatherByDateRange = async (
  fromDate: string,
  toDate: string
): Promise<WeatherData[]> => {
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
  locationId: number
): Promise<WeatherData[]> => {
  return await WeatherModel.findByLocationId(locationId);
};

// Delete weather records on a specific date and error if nothing was removed.
const deleteWeatherByDate = async (
  date: string
): Promise<{ deleted: number }> => {
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
