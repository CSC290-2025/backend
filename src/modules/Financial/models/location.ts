import { handlePrismaError } from '@/errors';
import { LocationSchemas } from '../schemas';
import type { z } from 'zod';

type LocationIQResponse = z.infer<
  typeof LocationSchemas.LocationIQResponseSchema
>;

const getNearbyPlaces = async (
  lat: number,
  lon: number,
  radius: number,
  tag: string
): Promise<LocationIQResponse> => {
  try {
    const accessToken = process.env.G11_LOCATIONIQ_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('LocationIQ access token is not configured');
    }

    const url = `https://us1.locationiq.com/v1/nearby?lat=${lat}&lon=${lon}&key=${accessToken}&radius=${radius}&tag=${tag}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(
        `LocationIQ API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return LocationSchemas.LocationIQResponseSchema.parse(data);
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getNearbyPlaces };
