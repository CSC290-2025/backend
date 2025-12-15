import { LocationService } from '../services';
import type { Context } from 'hono';

const getNearbyPlaces = async (c: Context) => {
  const query = c.req.query();

  const response = await LocationService.getNearbyPlaces({
    lat: Number(query.lat),
    lon: Number(query.lon),
    radius: Number(query.radius || 1000),
    tag: query.tag || 'bank',
  });

  return c.json(response, 200);
};

export { getNearbyPlaces };
