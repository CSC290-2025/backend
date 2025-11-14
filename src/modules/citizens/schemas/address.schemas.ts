import { z } from 'zod';
import { createGetRoute } from '@/utils/openapi-helpers';

export const AddressSchema = z.object({
  id: z.number(),
  address_line: z.string().nullable(),
  province: z.string().nullable(),
  district: z.string().nullable(),
  subdistrict: z.string().nullable(),
  postal_code: z.string().nullable(),
});

export const UserWithAddressSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  address: AddressSchema.nullable(),
});

export const GetUsersByDistrictQuery = z.object({
  district: z.string(),
});

export const getUsersByDistrictRoute = createGetRoute({
  path: '/addresses/users',
  summary: 'Get users by district',
  responseSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
      district: z.string(),
      count: z.number(),
      addresses: z.array(AddressSchema),
    }),
  }),
  query: GetUsersByDistrictQuery,
  tags: ['Addresses'],
});
