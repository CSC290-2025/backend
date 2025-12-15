import { NotFoundError } from '@/errors';
import { LocationModel } from '../models';
import { LocationSchemas } from '../schemas';
import type { z } from 'zod';

type NearbyPlacesResponse = z.infer<
  typeof LocationSchemas.NearbyPlacesResponseSchema
>;

const getNearbyPlaces = async (
  rawQuery: Record<string, string>
): Promise<NearbyPlacesResponse> => {
  const { lat, lon, radius, tag, limit } =
    LocationSchemas.NearbyPlacesQuerySchema.parse(rawQuery);

  const places = await LocationModel.getNearbyPlaces(
    lat,
    lon,
    radius,
    limit,
    tag
  );

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
