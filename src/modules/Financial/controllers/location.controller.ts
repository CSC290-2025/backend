import { LocationService } from '../services';
import type { Context } from 'hono';
import { successResponse } from '@/utils/response';

const getNearbyPlaces = async (c: Context) => {
  const query = c.req.query();
  const response = await LocationService.getNearbyPlaces(query);
  return successResponse(c, { places: response });
};

export { getNearbyPlaces };
