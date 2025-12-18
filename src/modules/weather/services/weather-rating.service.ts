import type { Prisma } from '@/generated/prisma';
import prisma from '@/config/client';
import { WeatherRatingModel } from '../models';
import type {
  WeatherRating,
  WeatherRatingAverageItem,
  WeatherRatingAverageQuery,
  WeatherRatingCreateInput,
} from '../types';
import { NotFoundError, ValidationError } from '@/errors';
import { getDistrictByAddressId, getDistrictByLocationId } from '../utils';

type WeatherRatingRecord = Prisma.weather_ratingGetPayload<{
  include: {
    addresses: { select: { district: true } };
  };
}>;

// Guarded conversion to YYYY-MM-DD regardless of Date/string input.
const formatDateOnly = (value: Date | string): string => {
  const dateInstance = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateInstance.getTime())) {
    throw new ValidationError('Invalid date value. Expected a valid date');
  }
  return dateInstance.toISOString().slice(0, 10);
};

// Translate an address id to the configured location id, if any mapping exists.
const mapAddressIdToLocationId = (addressId: number | null): number | null => {
  if (addressId == null) {
    return null;
  }
  const district = getDistrictByAddressId(addressId);
  return district?.location_id ?? addressId;
};

// Convert a Prisma record into the WeatherRating DTO, validating critical fields.
const mapToWeatherRating = (record: WeatherRatingRecord): WeatherRating => {
  if (!record.date) {
    throw new ValidationError('Weather rating record does not have a date');
  }

  if (record.rating === null) {
    throw new ValidationError('Weather rating record does not have a rating');
  }

  return {
    id: record.id,
    location_id: mapAddressIdToLocationId(record.address_id ?? null),
    date: formatDateOnly(record.date),
    rating: Number(record.rating),
    district: record.addresses?.district ?? null,
  };
};

// Resolve a public location id into a persisted address id, validating existence.
const resolveAddressId = async (locationId: number): Promise<number> => {
  const district = getDistrictByLocationId(locationId);
  const addressId = district?.address_id ?? locationId;
  const address = await prisma.addresses.findUnique({
    where: { id: addressId },
  });
  if (!address) {
    throw new NotFoundError(
      district
        ? `address_id ${district.address_id} mapped from location_id ${locationId} not found`
        : 'location_id not found in addresses table'
    );
  }
  return address.id;
};

// Create a rating for the resolved location using the current Bangkok date.
const createWeatherRating = async (
  payload: WeatherRatingCreateInput
): Promise<WeatherRating> => {
  const addressId = await resolveAddressId(payload.location_id);
  const record = await WeatherRatingModel.create({
    address_id: addressId,
    rating: payload.rating,
  });
  return mapToWeatherRating(record);
};

// List all ratings while skipping legacy rows that fail validation.
const listWeatherRatings = async (): Promise<WeatherRating[]> => {
  const records = await WeatherRatingModel.findAll();
  return records.flatMap((record) => {
    try {
      return [mapToWeatherRating(record)];
    } catch (error) {
      console.warn(
        'Skipping weather_rating record due to invalid data',
        record.id,
        error
      );
      return [];
    }
  });
};

// Return average ratings grouped by date and optional location filters.
const getAverageWeatherRatings = async (
  query: WeatherRatingAverageQuery
): Promise<WeatherRatingAverageItem[]> => {
  const normalizedQuery: WeatherRatingAverageQuery = { ...query };
  if (query.location_id !== undefined) {
    normalizedQuery.location_id = await resolveAddressId(query.location_id);
  }
  const averages =
    await WeatherRatingModel.getAverageByDateAndLocation(normalizedQuery);
  return averages.map((item) => ({
    ...item,
    location_id: mapAddressIdToLocationId(item.location_id),
  }));
};

// Delete all ratings on a specific date and error if nothing was removed.
const deleteWeatherRatingsByDate = async (
  date: string
): Promise<{ deleted: number }> => {
  const deleted = await WeatherRatingModel.deleteByDate(date);
  if (deleted === 0) {
    throw new NotFoundError('No weather ratings found for the given date');
  }
  return { deleted };
};

// Delete every record from weather_rating and return the count removed.
const deleteAllWeatherRatings = async (): Promise<{ deleted: number }> => {
  const deleted = await WeatherRatingModel.deleteAll();
  return { deleted };
};

export {
  listWeatherRatings,
  createWeatherRating,
  getAverageWeatherRatings,
  deleteWeatherRatingsByDate,
  deleteAllWeatherRatings,
};
