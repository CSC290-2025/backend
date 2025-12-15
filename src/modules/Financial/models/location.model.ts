import { NotFoundError, ValidationError } from '@/errors';
import { LocationSchemas } from '../schemas';
import type { z } from 'zod';

type LocationIQResponse = z.infer<
  typeof LocationSchemas.LocationIQResponseSchema
>;

const getNearbyPlaces = async (
  lat: number,
  lon: number,
  radius: number,
  limit?: number,
  tag?: string
): Promise<LocationIQResponse> => {
  const accessToken = process.env.G11_LOCATIONIQ_ACCESS_TOKEN;
  if (!accessToken)
    throw new ValidationError('LocationIQ access token not configured');

  let url = `https://us1.locationiq.com/v1/nearby?lat=${lat}&lon=${lon}&key=${accessToken}&radius=${radius}`;
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
    throw new Error(`LocationIQ error: ${response.status}`);
  }

  const data = await response.json();
  return LocationSchemas.LocationIQResponseSchema.parse(data);
};

export { getNearbyPlaces };
