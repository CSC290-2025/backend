import { success, z } from 'zod';
import { createGetRoute } from '@/utils/openapi-helpers';

// Specialist schema
const SpecialistSchema = z.object({
  id: z.number(),
  specialty_name: z.string(),
});

// Response schema — matching your Address API style
const UserSpecialistResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    userId: z.number(),
    specialists: z.array(SpecialistSchema),
  }),
});

// Params (userId in path)
const UserIdParam = z.object({
  id: z.string().regex(/^\d+$/, 'User ID must be a number'),
});

// OpenAPI route definition
// const getUserSpecialistsRoute = createGetRoute({
//   path: '/users/{id}/specialists',
//   summary: 'Get specialists by user ID',
//   description: 'Retrieve all specialties linked to a specific user.',
//   params: UserIdParam,
//   responseSchema: UserSpecialistResponseSchema,
//   tags: ['Users'],
// });

const getUserSpecialistsRoute = createGetRoute({
  path: '/specialists/user/{id}',
  summary: 'Get specialists by user ID',
  responseSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
      userId: z.number(),
      specialists: z.array(SpecialistSchema),
    }),
  }),
  params: UserIdParam,
  tags: ['Specialists'],
});

export const UserSpecialistSchemas = {
  SpecialistSchema,
  UserSpecialistResponseSchema,
  UserIdParam,
  getUserSpecialistsRoute,
};
