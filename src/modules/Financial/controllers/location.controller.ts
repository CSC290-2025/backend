import { LocationService } from '../services';
import type { Context } from 'hono';

const getNearbyPlaces = async (c: Context) => {
  const query = c.req.query();

  const response = await LocationService.getNearbyPlaces({
    lat: Number(query.lat),
    lon: Number(query.lon),
    radius: Number(query.radius || 1000),
    tag: query.tag,
    limit: Number(query.limit || 10),
  });

  return c.json(response, 200);
};

export { getNearbyPlaces };
