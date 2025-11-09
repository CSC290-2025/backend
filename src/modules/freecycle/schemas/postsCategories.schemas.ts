import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { AuthMiddleware } from '@/middlewares';

const FreecyclePostsCategoriesSchema = z.object({
  post_id: z.number(),
  category_id: z.number(),
});

const createPostsCategoriesSchema = z.object({
  post_id: z.number(),
  category_id: z.number(),
});

const updatePostsCategoriesSchema = z.object({
  post_id: z.number(),
  category_id: z.number().optional(),
});

export const FreecyclePostsCategoriesSchemas = {
  FreecyclePostsCategoriesSchema,
  createPostsCategoriesSchema,
  updatePostsCategoriesSchema,
};
