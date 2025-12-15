import { LocationService } from '../services';
import type { Context } from 'hono';

const getNearbyPlaces = async (c: Context) => {
  const query = c.req.query();
  const response = await LocationService.getNearbyPlaces(query);
  return c.json(response, 200);
};

export { getNearbyPlaces };
