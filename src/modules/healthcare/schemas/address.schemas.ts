import { z } from 'zod';
import { createGetRoute } from '@/utils/openapi-helpers';

const AddressSchema = z.object({
  id: z.number().int(),
  address_line: z.string().max(255).nullable(),
  province: z.string().max(255).nullable(),
  district: z.string().max(255).nullable(),
  subdistrict: z.string().max(255).nullable(),
  postal_code: z.string().max(20).nullable(),
});

const AddressListSchema = z.object({
  addresses: z.array(AddressSchema),
});

const listAddressesRoute = createGetRoute({
  path: '/healthcare/addresses',
  summary: 'List healthcare addresses',
  responseSchema: AddressListSchema,
  tags: ['Healthcare Addresses'],
});

export const AddressSchemas = {
  AddressSchema,
  AddressListSchema,
  listAddressesRoute,
};
