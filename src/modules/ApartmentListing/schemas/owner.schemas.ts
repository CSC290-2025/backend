import { createGetRoute } from '@/utils/openapi-helpers';
import z from 'zod';

const ApartmentOwnerSchema = z.object({
  id: z.coerce.number().int().positive(),
  user_id: z.coerce.number().int().positive(),
  apartment_id: z.coerce.number().int().positive(),
});

const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  role_id: z.number().nullable(),
  created_at: z.string(),
});

const getApartmentOwnerByApartmentIdRoute = createGetRoute({
  path: '/apartments/{id}/owners',
  summary: 'Get apartment owners by apartment ID',
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  responseSchema: z.array(ApartmentOwnerSchema),
  tags: ['APTOwner'],
});

const findUserByIdRoute = createGetRoute({
  path: '/users/{id}',
  summary: 'Find user by ID',
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  responseSchema: UserSchema,
  tags: ['User'],
});

export const ownerSchemas = {
  ApartmentOwnerSchema,
  UserSchema,
  getApartmentOwnerByApartmentIdRoute,
  findUserByIdRoute,
};
