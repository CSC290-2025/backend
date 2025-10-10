import * as RatingModel from '../models/rating.model';
import { successResponse } from '@/utils/response';
import type { Context } from 'hono';

export async function getAllRatings(c: Context) {
  const ratings = await RatingModel.getAllComments();
  return successResponse(c, { ratings });
}
export async function getCommentsByApartment(c: Context) {
  const apartmentId = Number(c.req.param('apartmentId'));
  const comments = await RatingModel.getCommentsByApartment(apartmentId);
  return successResponse(c, { comments });
}
export async function getAverageRatingByApartment(c: Context) {
  const apartmentId = Number(c.req.param('apartmentId'));
  const averageRating =
    await RatingModel.getAverageRatingByApartment(apartmentId);
  return successResponse(c, { averageRating });
}
export async function getOverallAverageRating(c: Context) {
  const overallAverageRating = await RatingModel.getOverallAverageRating();
  return successResponse(c, { overallAverageRating });
}
export async function addRating(c: Context) {
  const { user_id, apartmentId, rating, comment } = await c.req.json();
  const newRating = await RatingModel.createRating(
    user_id,
    apartmentId,
    rating,
    comment
  );
  return successResponse(c, { rating: newRating });
}
export async function updateRating(c: Context) {
  const id = Number(c.req.param('id'));
  const { rating, comment } = await c.req.json();
  const updatedRating = await RatingModel.updateRating(id, rating, comment);
  return successResponse(c, { rating: updatedRating });
}
export async function deleteRating(c: Context) {
  const id = Number(c.req.param('id'));
  await RatingModel.deleteRating(id);
  return successResponse(c, { message: 'Rating deleted successfully' });
}
