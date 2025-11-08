import { apartmentService, ratingService } from '../service/index.ts';
import { successResponse } from '@/utils/response';
import type { Context } from 'hono';
import { NotFoundError } from '@/errors';

export async function getAllRatings(c: Context) {
  const ratings = await ratingService.getAllComments();
  return successResponse(c, { ratings });
}
export async function getCommentsByApartment(c: Context) {
  const id = Number(c.req.param('id'));
  const apartment = await apartmentService.getApartmentByID(id);
  const comments = await ratingService.getCommentsByApartment(apartment.id);
  return successResponse(c, { comments });
}
export async function getAverageRatingByApartment(c: Context) {
  const apartmentId = Number(c.req.param('id'));
  // Check if apartment exists without fetching rating
  const apartment = await apartmentService.getApartmentByID(apartmentId);
  if (!apartment) throw new NotFoundError('Apartment not found');
  // Get the average rating directly
  const averageRating =
    await ratingService.getAverageRatingByApartment(apartmentId);
  return successResponse(c, { averageRating });
}

export async function createRatingController(c: Context) {
  const data = await c.req.json();
  const newRating = await ratingService.createRating(data);
  return successResponse(
    c,
    { rating: newRating },
    201,
    'Rating created successfully'
  );
}
export async function updateRatingController(c: Context) {
  const data = await c.req.json();
  const updatedRating = await ratingService.updateRating(data);
  return successResponse(
    c,
    { rating: updatedRating },
    200,
    'Rating updated successfully'
  );
}
export async function deleteRatingController(c: Context) {
  const id = Number(c.req.param('id'));
  await ratingService.deleteRating(id);
  return successResponse(c, { message: 'Rating deleted successfully' }, 200);
}
