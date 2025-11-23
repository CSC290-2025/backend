import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { WeatherData } from '../types';

const findAll = async (): Promise<WeatherData[]> => {
  try {
    const items = await prisma.weather_data.findMany({
      orderBy: { created_at: 'desc' },
    });
    return items as unknown as WeatherData[];
  } catch (error) {
    console.error('Prisma error in findAll:', error);
    handlePrismaError(error);
  }
};

const findByLocationId = async (locationId: number): Promise<WeatherData[]> => {
  try {
    const items = await prisma.weather_data.findMany({
      where: { location_id: locationId },
      orderBy: { created_at: 'desc' },
    });
    return items as unknown as WeatherData[];
  } catch (error) {
    console.error('Prisma error in findByLocationId:', error);
    handlePrismaError(error);
  }
};

const findByDate = async (date: string): Promise<WeatherData[]> => {
  try {
    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59Z`);
    const items = await prisma.weather_data.findMany({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return items as unknown as WeatherData[];
  } catch (error) {
    console.error('Prisma error in findByDate:', error);
    handlePrismaError(error);
  }
};

const findByDateRange = async (
  fromDate: string,
  toDate: string
): Promise<WeatherData[]> => {
  try {
    const startOfDay = new Date(`${fromDate}T00:00:00Z`);
    const endOfDay = new Date(`${toDate}T23:59:59Z`);
    const items = await prisma.weather_data.findMany({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return items as unknown as WeatherData[];
  } catch (error) {
    console.error('Prisma error in findByDateRange:', error);
    handlePrismaError(error);
  }
};

const create = async (data: any): Promise<WeatherData> => {
  try {
    const weather = await prisma.weather_data.create({
      data,
    });
    return weather as unknown as WeatherData;
  } catch (error) {
    console.error('Prisma error in create:', error);
    handlePrismaError(error);
  }
};

const deleteByDate = async (date: string): Promise<number> => {
  try {
    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59Z`);
    const result = await prisma.weather_data.deleteMany({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error('Prisma error in deleteByDate:', error);
    handlePrismaError(error);
  }
};

const deleteAll = async (): Promise<number> => {
  try {
    const result = await prisma.weather_data.deleteMany({});
    return result.count;
  } catch (error) {
    console.error('Prisma error in deleteAll:', error);
    handlePrismaError(error);
  }
};

export {
  findAll,
  findByLocationId,
  findByDate,
  findByDateRange,
  create,
  deleteByDate,
  deleteAll,
};
