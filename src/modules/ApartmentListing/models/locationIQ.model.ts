import { LocationIQSchemas } from '../schemas/index';
import { NotFoundError, handlePrismaError, ValidationError } from '@/errors';
import type { PlaceListType } from '../types';
import prisma from '@/config/client';

const LatLongConverter = async (q: string) => {
  try {
    const url = `https://us1.locationiq.com/v1/search?q=${encodeURIComponent(q)}&accept-language=en%2C%20th&countrycodes=th&format=json&key=pk.d84d79928fa442aae1e0da75564b2ab1`;
    const options = { method: 'GET', headers: { accept: 'application/json' } };
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new ValidationError(
        `LocationIQ API error: ${response.status} ${response.statusText}`
      );
    }
    const json = await response.json();
    // LocationIQ returns an array of results, get the first one (it has only one)
    if (!Array.isArray(json) || json.length === 0) {
      throw new NotFoundError('No results found for the provided query');
    }
    const firstResult = json[0];
    const data = {
      lat: firstResult.lat,
      lon: firstResult.lon,
    };
    return LocationIQSchemas.latLongSchema.parse(data);
  } catch (error) {
    handlePrismaError(error);
  }
};
const getNearbyPlacesFiltered = async (
  lat: number,
  lon: number,
  radius: number,
  limit: number = 4,
  tag?: string
): Promise<PlaceListType> => {
  const accessToken = process.env.G09_LOCATIONIQ_API_KEY;
  if (!accessToken)
    throw new ValidationError('LocationIQ access token not configured');

  let url = `https://us1.locationiq.com/v1/nearby?lat=${lat}&lon=${lon}&tag=amenity%3A%2A%2C%21amenity%3Ahospital%2C%21amenity%3Abank%2C%21amenity%3Aatm%2C%21amenitypharmacy&key=${accessToken}&radius=${radius}`;
  if (limit) url += `&limit=${limit}`;
  if (tag) url += `&tag=${tag}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { accept: 'application/json' },
  });

  if (response.status === 404) {
    throw new NotFoundError('No places found nearby');
  }

  if (!response.ok) {
    throw new ValidationError(`LocationIQ error: ${response.status}`);
  }

  const data = await response.json();
  return LocationIQSchemas.nearbySchemaList.parse(data);
};

const getDistance = async (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> => {
  const accessToken = process.env.G09_LOCATIONIQ_API_KEY;
  if (!accessToken)
    throw new ValidationError('LocationIQ access token not configured');

  const url = `https://us1.locationiq.com/v1/directions/driving/${lon1}%2C${lat1}%3B${lon2}%2C${lat2}?radiuses=1000%3B1000&alternatives=0&key=${accessToken}`;
  const options = { method: 'GET', headers: { accept: 'application/json' } };
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new ValidationError(`LocationIQ error: ${response.status}`);
  }

  const json = await response.json();
  if (!json.routes || json.routes.length === 0) {
    throw new NotFoundError('No routes found for the provided coordinates');
  }

  const distance = json.routes[0].distance; // distance in meters
  return distance;
};

const insertLatLong = async (
  addressId: number,
  address_line: string,
  province: string,
  district: string,
  subdistrict: string,
  postal_code: string
) => {
  const country = 'Thailand';
  const latLong = await LatLongConverter(
    `${address_line}, ${province}, ${district}, ${subdistrict}, ${postal_code}, ${country}`
  );
  await prisma.addresses.update({
    where: { id: addressId },
    data: {
      latitude: latLong.lat,
      longitude: latLong.lon,
    },
  });
  return latLong;
};
export {
  insertLatLong,
  getDistance,
  LatLongConverter,
  getNearbyPlacesFiltered,
};
