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

const AddCategoryToPostSchema = z.object({
  category_id: z.number(),
});

const AddCategoriesToPostSchema = z.object({
  category_ids: z.array(z.number()).min(1, 'At least one category is required'),
});

const PostIdParam = z.object({
  postId: z.coerce.number(),
});

const CategoryIdParam = z.object({
  categoryId: z.coerce.number(),
});

const PostCategoryParams = z.object({
  postId: z.coerce.number(),
  categoryId: z.coerce.number(),
});

const getPostCategoriesRoute = createGetRoute({
  path: '/posts/{postId}/categories',
  summary: 'Get categories of post',
  responseSchema: z.array(FreecyclePostsCategoriesSchema),
  params: PostIdParam,
  tags: ['Freecycle-PostCategories'],
});

const addCategoryToPostRoute = createPostRoute({
  path: '/posts/{postId}/categories',
  summary: 'add category to post',
  requestSchema: AddCategoryToPostSchema,
  responseSchema: FreecyclePostsCategoriesSchema,
  params: PostIdParam,
  tags: ['Freecycle-PostCategories'],
  middleware: [AuthMiddleware.isUser],
});

const addCategoriesToPostRoute = createPostRoute({
  path: '/posts/{postId}/categories/add',
  summary: 'add category to post',
  requestSchema: AddCategoriesToPostSchema,
  responseSchema: z.array(FreecyclePostsCategoriesSchema),
  params: PostIdParam,
  tags: ['Freecycle-PostCategories'],
  middleware: [AuthMiddleware.isUser],
});

const removeCategoriesFromPostRoute = createDeleteRoute({
  path: '/posts/{postId}/categories/{categoryId}',
  summary: 'remove categories from post',
  params: PostCategoryParams,
  tags: ['Freecycle-PostCategories'],
  middleware: [AuthMiddleware.isUser],
});

export const FreecyclePostsCategoriesSchemas = {
  FreecyclePostsCategoriesSchema,
  AddCategoryToPostSchema,
  AddCategoriesToPostSchema,
  PostIdParam,
  CategoryIdParam,
  PostCategoryParams,
  getPostCategoriesRoute,
  addCategoryToPostRoute,
  addCategoriesToPostRoute,
  removeCategoriesFromPostRoute,
};
