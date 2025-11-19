import { z } from 'zod';
import { createGetRoute } from '@/utils/openapi-helpers';

const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  role_id: z.number().nullable(),
  created_at: z.string(),
});

const getUsersByRoleRoute = createGetRoute({
  path: '/users/filter',
  summary: 'Get users by role',
  query: z.object({
    role: z.string().describe('Role name to filter users by'),
  }),
  responseSchema: z.array(UserSchema),
  tags: ['Users'],
});

export const userRoleSchema = {
  UserSchema,
  getUsersByRoleRoute,
};
