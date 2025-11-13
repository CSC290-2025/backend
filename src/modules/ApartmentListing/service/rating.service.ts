import { apartmentModel, ratingModel } from '../models';
import { NotFoundError } from '@/errors';
import type { Rating, createRatingData, updateRatingData } from '../types';

const getCommentsByApartment = async (
  apartmentId: number
): Promise<Rating[]> => {
  const existingApartment = await apartmentModel.getApartmentById(apartmentId);
  if (!existingApartment) throw new NotFoundError('Apartment not found');
  const comments = await ratingModel.getCommentsByApartment(apartmentId);

  if (!comments) throw new NotFoundError('No comments found');
  return comments.map((comment) => ({
    id: comment.id,
    apartmentId,
    userId: comment.users.id,
    rating: comment.rating,
    comment: comment.comment,
  }));
};
const getAverageRatingByApartment = async (
  apartmentId: number
): Promise<number> => {
  const existingApartment = await apartmentModel.getApartmentById(apartmentId);
  if (!existingApartment) throw new NotFoundError('Apartment not found');
  const apartment = await ratingModel.getAverageRatingByApartment(apartmentId);
  if (apartment === null) throw new NotFoundError('Apartment not found');
  return apartment;
};
const getAllComments = async (): Promise<Rating[]> => {
  const comments = await ratingModel.getAllComments();
  if (!comments) throw new NotFoundError('No comments found');
  return comments.map((comment) => ({
    id: comment.id,
    apartmentId: comment.apartment?.id ?? 0,
    userId: comment.user_id,
    rating: comment.rating,
    comment: comment.comment,
  }));
};

const createRating = async (data: createRatingData): Promise<Rating> => {
  const existingApartment = await apartmentModel.getApartmentById(
    data.apartmentId
  );
  if (!existingApartment) throw new NotFoundError('Apartment not found');
  const rating = await ratingModel.createRating(data);
  if (!rating) throw new NotFoundError('Failed to create rating');
  return {
    id: rating.id,
    apartmentId: data.apartmentId,
    userId: data.userId,
    rating: data.rating ?? 1,
    comment: data.comment ?? '',
  };
};

const updateRating = async (data: updateRatingData): Promise<Rating> => {
  const existingRating = await ratingModel.updateRating(data);
  if (!existingRating) throw new NotFoundError('Rating not found');

  return {
    id: existingRating.id,
    apartmentId: existingRating.apartment?.id ?? 0,
    userId: existingRating.user_id,
    rating: existingRating.rating,
    comment: existingRating.comment,
  };
};
const deleteRating = async (id: number): Promise<void> => {
  const existingRating = await ratingModel.deleteRating(id);
  if (!existingRating) throw new NotFoundError('Rating not found');
};
export {
  getCommentsByApartment,
  getAverageRatingByApartment,
  getAllComments,
  createRating,
  updateRating,
  deleteRating,
};
