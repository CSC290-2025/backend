import { successResponse } from '@/utils/response';
import type { Context } from 'hono';
import { locationIQModel } from '../models';

export async function getCoords(c: Context) {
  const q = String(c.req.query());
  const coords = await locationIQModel.LatLongConverter(q);
  return successResponse(c, coords);
}

// export async function createRatingController(c: Context) {
//   const data = await c.req.json();
//   const newRating = await locationIQModel.createRating(data);
//   return successResponse(c, newRating, 201, 'Rating created successfully');
// }
// export async function updateRatingController(c: Context) {
//   const ratingId = Number(c.req.param('id'));
//   const data = await c.req.json();
//   const updatedRating = await ratingService.updateRating(ratingId, data);
//   return successResponse(c, updatedRating, 200, 'Rating updated successfully');
// }
