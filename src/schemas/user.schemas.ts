import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  avatar: z.url().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  avatar: z.url().optional(),
});

const UserIdParam = z.object({
  id: z.uuid(),
});

const UserQuery = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  search: z.string().optional(),
});

// route definitions, not actually schemas
const getUsersRoute = createGetRoute({
  path: '/users',
  summary: 'Get all users',
  responseSchema: z.object({
    users: z.array(UserSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }),
  }),
  query: UserQuery,
  tags: ['Users'],
});

const getUserRoute = createGetRoute({
  path: '/users/{id}',
  summary: 'Get user by ID',
  responseSchema: z.object({ user: UserSchema }),
  params: UserIdParam,
  tags: ['Users', 'Public'], // example for multiple tags, so we can have duplicate endpoints in some? ig
});

const createUserRoute = createPostRoute({
  path: '/users',
  summary: 'Create user',
  requestSchema: CreateUserSchema,
  responseSchema: z.object({ user: UserSchema }),
  tags: ['Users'],
});

const updateUserRoute = createPutRoute({
  path: '/users/{id}',
  summary: 'Update user',
  requestSchema: CreateUserSchema.partial(),
  responseSchema: z.object({ user: UserSchema }),
  params: UserIdParam,
  tags: ['Users'],
});

const deleteUserRoute = createDeleteRoute({
  path: '/users/{id}',
  summary: 'Delete user',
  params: UserIdParam,
  tags: ['Users'],
});

export {
  UserSchema,
  CreateUserSchema,
  UserIdParam,
  UserQuery,
  getUsersRoute,
  getUserRoute,
  createUserRoute,
  updateUserRoute,
  deleteUserRoute,
};
