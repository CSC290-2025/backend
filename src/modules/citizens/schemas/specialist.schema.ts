import { z } from 'zod';
import { createGetRoute } from '@/utils/openapi-helpers';

const SpecialistSchema = z.object({
  id: z.number(),
  specialty_name: z.string(),
});

const UserSpecialistResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    userId: z.number(),
    specialists: z.array(SpecialistSchema),
  }),
});

const UserIdParam = z.object({
  id: z.string().regex(/^\d+$/, 'User ID must be a number'),
});

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
