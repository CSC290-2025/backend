import { NotFoundError } from '@/errors';
import { LocationModel } from '../models';
import type { LocationSchemas } from '../schemas';
import type { z } from 'zod';

type NearbyPlacesQuery = z.infer<
  typeof LocationSchemas.NearbyPlacesQuerySchema
>;
type LocationIQResponse = z.infer<
  typeof LocationSchemas.LocationIQResponseSchema
>;
type NearbyPlacesResponse = z.infer<
  typeof LocationSchemas.NearbyPlacesResponseSchema
>;

const getNearbyPlaces = async (
  query: NearbyPlacesQuery
): Promise<NearbyPlacesResponse> => {
  const { lat, lon, radius, tag } = query;

  const places = await LocationModel.getNearbyPlaces(lat, lon, radius, tag);

  if (!places || places.length === 0) {
    throw new NotFoundError('No places found within the specified radius');
  }

  const data = places
    .map((place) => ({
      name: place.name || null,
      type: place.type,
      lat: place.lat,
      lon: place.lon,
      distance: place.distance || null,
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export { getNearbyPlaces };
