import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { AuthMiddleware } from '@/middlewares';

const FreecyclePostsSchema = z.object({
  id: z.number(),
  item_name: z.string(),
  item_weight: z.number().nullable(),
  photo_url: z.string().nullable(),
  description: z.string().nullable(),
  donater_id: z.number().nullable(),
  donate_to_department_id: z.number().nullable(),
  is_given: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const CreateFreecyclePostsSchema = z.object({
  item_name: z.string().max(255),
  item_weight: z.number().nullable(),
  photo_url: z.string().nullable(),
  description: z.string().nullable(),
  donate_to_department_id: z.number().nullable(),
});

const UpdateFreecyclePostsSchema = z.object({
  item_name: z.string().max(255).optional(),
  item_weight: z.number().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  donate_to_department_id: z.number().nullable().optional(),
  is_given: z.boolean().optional(),
});

const MarkAsGivenSchema = z.object({
  is_given: z.boolean(),
});

const MarkAsNotGivenSchema = z.object({
  is_given: z.boolean(),
});

const FreecyclePostsIdParam = z.object({
  id: z.coerce.number(),
});

const getFreecycleAllPostsRoute = createGetRoute({
  path: '/posts',
  summary: 'Get all posts',
  responseSchema: z.array(FreecyclePostsSchema),
  tags: ['Freecycle'],
});

const getFreecyclePostRoute = createGetRoute({
  path: '/posts/{id}',
  summary: 'Get post by id',
  responseSchema: FreecyclePostsSchema,
  params: FreecyclePostsIdParam,
  tags: ['Freecycle'],
});

const getUserFreecyclePostsRoute = createGetRoute({
  path: '/posts/me',
  summary: 'Get post by user',
  responseSchema: FreecyclePostsSchema,
  tags: ['Freecycle'],
  middleware: [AuthMiddleware.isUser],
});

const createFreecyclePostsRoute = createPostRoute({
  path: '/posts',
  summary: 'create post',
  requestSchema: CreateFreecyclePostsSchema,
  responseSchema: FreecyclePostsSchema,
  tags: ['Freecycle'],
  middleware: [AuthMiddleware.isUser],
});

const UpdateFreecyclePostsRoute = createPutRoute({
  path: '/posts/{id}',
  summary: 'Update post',
  requestSchema: UpdateFreecyclePostsSchema,
  responseSchema: FreecyclePostsSchema,
  params: FreecyclePostsIdParam,
  tags: ['Freecycle'],
  middleware: [AuthMiddleware.isUser],
});

const DeleteFreecyclePostsRoute = createDeleteRoute({
  path: '/posts/{id}',
  summary: 'Delete post',
  params: FreecyclePostsIdParam,
  tags: ['Freecycle'],
  middleware: [AuthMiddleware.isUser],
});

const MarkAsGivenRoute = createPutRoute({
  path: '/posts/{id}/given',
  summary: 'Mark a post as given',
  requestSchema: MarkAsGivenSchema,
  responseSchema: FreecyclePostsSchema,
  params: FreecyclePostsIdParam,
  tags: ['Freecycle'],
  middleware: [AuthMiddleware.isUser],
});

const MarkAsNotGivenRoute = createPutRoute({
  path: '/posts/{id}/not-given',
  summary: 'Mark a post as not given',
  requestSchema: MarkAsNotGivenSchema,
  responseSchema: FreecyclePostsSchema,
  params: FreecyclePostsIdParam,
  tags: ['Freecycle'],
  middleware: [AuthMiddleware.isUser],
});

const getNotGivenPostsRoute = createGetRoute({
  path: '/posts/not-given',
  summary: 'Get all posts that not given',
  responseSchema: z.array(FreecyclePostsSchema),
  tags: ['Freecycle'],
});

const CategoryIdParam = z.object({
  categoryId: z.coerce.number(),
});

const getPostsByCategoryRoute = createGetRoute({
  path: '/posts/category/{categoryId}',
  summary: 'Get post by category Id',
  responseSchema: z.array(FreecyclePostsSchema),
  params: CategoryIdParam,
  tags: ['Freecycle'],
});

export const FreecyclePostsSchemas = {
  FreecyclePostsSchema,
  CreateFreecyclePostsSchema,
  UpdateFreecyclePostsSchema,
  MarkAsGivenSchema,
  MarkAsNotGivenSchema,
  FreecyclePostsIdParam,
  getFreecycleAllPostsRoute,
  getFreecyclePostRoute,
  getUserFreecyclePostsRoute,
  createFreecyclePostsRoute,
  UpdateFreecyclePostsRoute,
  DeleteFreecyclePostsRoute,
  MarkAsGivenRoute,
  MarkAsNotGivenRoute,
  getNotGivenPostsRoute,
  CategoryIdParam,
  getPostsByCategoryRoute,
};
