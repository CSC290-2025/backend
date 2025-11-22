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

const getAPTOwnerRoute = createGetRoute({
  path: '/users/roles/apartment-owners',
  summary: 'Get all apartment owners',
  responseSchema: z.array(UserSchema),
  tags: ['APTOwner'],
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

export const ownerSchemas = {
  ApartmentOwnerSchema,
  UserSchema,
  getAPTOwnerRoute,
  getApartmentOwnerByApartmentIdRoute,
};
