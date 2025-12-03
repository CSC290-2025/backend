import type { Prisma } from '@/generated/prisma';
import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { WeatherData } from '../types';

const BANGKOK_OFFSET = '+07:00';

// Build the UTC range for a Bangkok-local day used in date filtering.
const getBangkokDayRange = (date: string) => {
  const start = new Date(`${date}T00:00:00${BANGKOK_OFFSET}`);
  const end = new Date(`${date}T23:59:59.999${BANGKOK_OFFSET}`);
  return { start, end };
};

// Fetch every weather_data row ordered by creation date.
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

// Fetch weather_data rows filtered by location id.
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

// Fetch weather_data rows that fall within a specific Bangkok-local day.
const findByDate = async (date: string): Promise<WeatherData[]> => {
  try {
    const { start: startOfDay, end: endOfDay } = getBangkokDayRange(date);
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

// Fetch weather_data rows across an inclusive Bangkok-local date range.
const findByDateRange = async (
  fromDate: string,
  toDate: string
): Promise<WeatherData[]> => {
  try {
    const { start: startOfFromDate } = getBangkokDayRange(fromDate);
    const { end: endOfToDate } = getBangkokDayRange(toDate);
    const items = await prisma.weather_data.findMany({
      where: {
        created_at: {
          gte: startOfFromDate,
          lte: endOfToDate,
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

// Insert a new weather_data row.
const create = async (
  data: Omit<
    Prisma.weather_dataUncheckedCreateInput,
    'created_at' | 'updated_at'
  >
): Promise<WeatherData> => {
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

// Delete weather_data rows for a specific Bangkok-local day.
const deleteByDate = async (date: string): Promise<number> => {
  try {
    const { start: startOfDay, end: endOfDay } = getBangkokDayRange(date);
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

// Delete every row from weather_data.
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
