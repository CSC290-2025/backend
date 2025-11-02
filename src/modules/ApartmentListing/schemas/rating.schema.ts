import {
  createPostRoute,
  createPutRoute,
  createGetRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { ApartmentSchemas } from './index';
import { z } from 'zod';

const RatingSchema = z.object({
  id: z.int(),
  apartmentId: z.int(),
  userId: z.int(),
  rating: z.int().min(1).max(5).default(0).nullable(),
  comment: z.string().max(500).nullable(),
});

const RatingListSchema = z.array(RatingSchema);

const createRatingSchema = z.object({
  apartmentId: z.int(),
  userId: z.int(),
  rating: z.int().min(1).max(5).default(1).nullable(),
  comment: z.string().max(500).nullable(),
});

const updateRatingSchema = z.object({
  ratingId: z.int().positive(),
  rating: z.int().min(1).max(5).default(1).nullable(),
  comment: z.string().max(500).nullable(),
});

const deleteRatingSchema = z.object({
  id: z.int(),
});

//openAPI
const createRatingRoute = createPostRoute({
  path: '/ratings',
  summary: 'Create a new rating for an apartment',
  requestSchema: createRatingSchema,
  responseSchema: RatingSchema,
  tags: ['Rating'],
});

const updateRatingRoute = createPutRoute({
  path: '/ratings/{id}',
  summary: 'Update an existing rating',
  requestSchema: updateRatingSchema,
  responseSchema: RatingSchema,
  params: updateRatingSchema,
  tags: ['Rating'],
});
const deleteRatingRoute = createDeleteRoute({
  path: '/ratings/{id}',
  summary: 'Delete an existing rating',
  params: deleteRatingSchema,
  tags: ['Rating'],
});

const getCommentsByApartmentRoute = createGetRoute({
  path: '/apartments/{id}/ratings',
  summary: 'Get all ratings for an apartment',
  params: ApartmentSchemas.ApartmentIdParam,
  responseSchema: RatingListSchema,
  tags: ['Rating'],
});

const getAverageRatingByApartmentRoute = createGetRoute({
  path: '/apartments/{id}/ratings/average',
  summary: 'Get the average rating for an apartment',
  params: ApartmentSchemas.ApartmentIdParam,
  responseSchema: z.number().min(0).nullable(),
  tags: ['Rating'],
});

const getAllRatingsRoute = createGetRoute({
  path: '/apartments/{id}/ratings/comments',
  summary: 'Get all comments for an apartment',
  params: ApartmentSchemas.ApartmentIdParam,
  responseSchema: RatingListSchema,
  tags: ['Rating'],
});

export const RatingSchemas = {
  RatingSchema,
  RatingListSchema,
  createRatingSchema,
  updateRatingSchema,
  deleteRatingSchema,
  createRatingRoute,
  updateRatingRoute,
  deleteRatingRoute,
  getCommentsByApartmentRoute,
  getAverageRatingByApartmentRoute,
  getAllRatingsRoute,
};
