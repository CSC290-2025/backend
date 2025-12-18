import type { Prisma } from '@/generated/prisma';
import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  WeatherRatingAverageItem,
  WeatherRatingAverageQuery,
} from '../types';

const DATE_SLICE_LENGTH = 10;
const BANGKOK_OFFSET = '+07:00';
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

// Format stored Date objects back to YYYY-MM-DD strings using Bangkok local time.
const formatBangkokDateOnly = (date: Date | null): string | null => {
  if (!date) {
    return null;
  }
  const shifted = new Date(date.getTime() + BANGKOK_OFFSET_MS);
  return shifted.toISOString().slice(0, DATE_SLICE_LENGTH);
};

const getBangkokDayRange = (value: string) => {
  const start = new Date(`${value}T00:00:00${BANGKOK_OFFSET}`);
  const end = new Date(`${value}T23:59:59.999${BANGKOK_OFFSET}`);
  return { start, end };
};

const ratingInclude = {
  addresses: {
    select: { district: true },
  },
} satisfies Prisma.weather_ratingInclude;

type WeatherRatingWithAddress = Prisma.weather_ratingGetPayload<{
  include: typeof ratingInclude;
}>;

// Return weather ratings with their districts ordered from newest to oldest.
const findAll = async (): Promise<WeatherRatingWithAddress[]> => {
  try {
    return await prisma.weather_rating.findMany({
      include: ratingInclude,
      orderBy: { date: 'desc' },
    });
  } catch (error) {
    console.error('Prisma error in weather_rating.findMany:', error);
    handlePrismaError(error);
  }
};

// Create a weather rating while forcing the stored date to midnight UTC.
const create = async (data: {
  address_id: number;
  rating: number;
  user_id: number;
  date?: Date;
}): Promise<WeatherRatingWithAddress> => {
  try {
    return await prisma.weather_rating.create({
      data: {
        address_id: data.address_id,
        rating: data.rating,
        user_id: data.user_id,
        date: data.date,
      },
      include: ratingInclude,
    });
  } catch (error) {
    console.error('Prisma error in weather_rating.create:', error);
    handlePrismaError(error);
  }
};

// Delete ratings for the specified Bangkok date range.
const deleteByDate = async (date: string): Promise<number> => {
  try {
    const { start, end } = getBangkokDayRange(date);
    const result = await prisma.weather_rating.deleteMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error('Prisma error in weather_rating.deleteMany:', error);
    handlePrismaError(error);
  }
};

// Delete every weather rating row.
const deleteAll = async (): Promise<number> => {
  try {
    const result = await prisma.weather_rating.deleteMany();
    return result.count;
  } catch (error) {
    console.error('Prisma error in weather_rating.deleteMany (all):', error);
    handlePrismaError(error);
  }
};

// Return grouped averages filtered by date and/or location.
const getAverageByDateAndLocation = async (
  query: WeatherRatingAverageQuery
): Promise<WeatherRatingAverageItem[]> => {
  try {
    const where: Prisma.weather_ratingWhereInput = {};

    if (query.date) {
      const { start, end } = getBangkokDayRange(query.date);
      where.date = {
        gte: start,
        lte: end,
      };
    }

    if (query.location_id !== undefined) {
      where.address_id = query.location_id;
    }

    type GroupedResult = {
      date: Date | null;
      address_id: number | null;
      _avg: { rating: Prisma.Decimal | null };
      _count: { _all: number };
    };

    const grouped = (await prisma.weather_rating.groupBy({
      by: ['date', 'address_id'],
      where,
      _avg: { rating: true },
      _count: { _all: true },
    })) as GroupedResult[];

    const addressIds = Array.from(
      new Set(
        grouped
          .map((group) => group.address_id)
          .filter((id): id is number => typeof id === 'number')
      )
    );

    const addressDistricts =
      addressIds.length > 0
        ? await prisma.addresses.findMany({
            where: { id: { in: addressIds } },
            select: { id: true, district: true },
          })
        : [];

    const districtMap = new Map<number, string | null>(
      addressDistricts.map((item) => [item.id, item.district ?? null])
    );

    return grouped.map((group) => ({
      date: formatBangkokDateOnly(group.date),
      location_id: group.address_id ?? null,
      district:
        group.address_id === null
          ? null
          : (districtMap.get(group.address_id) ?? null),
      average_rating:
        group._avg.rating !== null && group._avg.rating !== undefined
          ? Number(group._avg.rating)
          : null,
      rating_count: group._count._all ?? 0,
    }));
  } catch (error) {
    console.error('Prisma error in weather_rating.groupBy:', error);
    handlePrismaError(error);
  }
};

export {
  findAll,
  create,
  deleteByDate,
  deleteAll,
  getAverageByDateAndLocation,
};
