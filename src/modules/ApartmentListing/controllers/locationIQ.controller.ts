import { successResponse } from '@/utils/response';
import type { Context } from 'hono';
import { locationIQModel } from '../models';

export async function getCoords(c: Context) {
  const q = String(c.req.query('q'));
  const coords = await locationIQModel.LatLongConverter(q);
  return successResponse(c, coords);
}

export async function getNearbyPlacesFilteredController(c: Context) {
  const lat = Number(c.req.query('lat'));
  const lon = Number(c.req.query('lon'));
  const radius = Number(c.req.query('radius')) || 1000;
  const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 0;
  const tag = c.req.query('tag') ? String(c.req.query('tag')) : '';

  const places = await locationIQModel.getNearbyPlacesFiltered(
    lat,
    lon,
    radius,
    limit,
    tag
  );
  return successResponse(c, places);
}

export async function getDistanceController(c: Context) {
  const lat1 = Number(c.req.query('lat1'));
  const lon1 = Number(c.req.query('lon1'));
  const lat2 = Number(c.req.query('lat2'));
  const lon2 = Number(c.req.query('lon2'));

  const distance = await locationIQModel.getDistance(lat1, lon1, lat2, lon2);
  return successResponse(c, { distance });
}
