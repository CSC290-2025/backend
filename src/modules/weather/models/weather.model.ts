import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  WeatherData,
  CreateWeatherData,
  UpdateWeatherData,
} from '../types';

const normalizeCreateData = (data: CreateWeatherData) => {
  return {
    ...data,
  };
};

const normalizeUpdateData = (data: UpdateWeatherData) => {
  return {
    ...data,
  };
};

const findById = async (id: number): Promise<WeatherData | null> => {
  try {
    const weather = await prisma.weather_data.findUnique({
      where: { id },
    });
    return weather;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findAll = async (): Promise<WeatherData[]> => {
  try {
    const items = await prisma.weather_data.findMany({
      orderBy: { created_at: 'desc' },
    });
    return items;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findByLocationId = async (locationId: number): Promise<WeatherData[]> => {
  try {
    const items = await prisma.weather_data.findMany({
      where: { location_id: locationId },
      orderBy: { created_at: 'desc' },
    });
    return items;
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateWeatherData): Promise<WeatherData> => {
  try {
    const payload = normalizeCreateData(data);
    const weather = await prisma.weather_data.create({
      data: payload,
    });
    return weather;
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: number,
  data: UpdateWeatherData
): Promise<WeatherData> => {
  try {
    const payload = normalizeUpdateData(data);
    const weather = await prisma.weather_data.update({
      where: { id },
      data: payload,
    });
    return weather;
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.weather_data.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteAll = async (): Promise<number> => {
  try {
    const result = await prisma.weather_data.deleteMany({});
    return result.count;
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findById,
  findAll,
  findByLocationId,
  create,
  update,
  deleteById,
  deleteAll,
};
