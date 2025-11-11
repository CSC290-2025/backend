import {
  createDeleteRoute,
  createGetRoute,
  createPostRoute,
  createPutRoute,
} from '@/utils/openapi-helpers';
import { z } from 'zod';

const addressSchema = z.object({
  id: z.int(),
  address_line: z.string().min(0).max(255).nullable(),
  province: z.string().min(0).max(255).nullable(),
  district: z.string().min(0).max(255).nullable(),
  subdistrict: z.string().min(0).max(255).nullable(),
  postal_code: z.string().min(0).max(20).nullable(),
});

const createAddressSchema = z.object({
  address_line: z.string().min(0).max(255).nullable(),
  province: z.string().min(0).max(255).nullable(),
  district: z.string().min(0).max(255).nullable(),
  subdistrict: z.string().min(0).max(255).nullable(),
  postal_code: z.string().min(0).max(20).nullable(),
});

const updateAddressSchema = z.object({
  address_line: z.string().min(0).max(255).nullable(),
  province: z.string().min(0).max(255).nullable(),
  district: z.string().min(0).max(255).nullable(),
  subdistrict: z.string().min(0).max(255).nullable(),
  postal_code: z.string().min(0).max(20).nullable(),
});

const addressParam = z.object({
  id: z.coerce.number().int().positive(),
});

//openapi
const getAddressByID = createGetRoute({
  path: '/address/{id}',
  summary: 'Get address by its id',
  params: addressParam,
  responseSchema: addressSchema,
  tags: ['address'],
});

const createAddressRoute = createPostRoute({
  path: '/address',
  summary: 'Create a new address',
  requestSchema: createAddressSchema,
  responseSchema: addressSchema,
  tags: ['address'],
});

const updateAddressRoute = createPutRoute({
  path: '/address/{id}',
  summary: 'Update an existing address',
  requestSchema: updateAddressSchema,
  responseSchema: addressSchema,
  params: addressParam,
  tags: ['address'],
});

const deleteAddressRoute = createDeleteRoute({
  path: '/address/{id}',
  summary: 'Delete an address',
  params: addressParam,
  tags: ['address'],
});

export const AddressSchemas = {
  addressSchema,
  createAddressSchema,
  updateAddressSchema,
  addressParam,
  getAddressByID,
  createAddressRoute,
  updateAddressRoute,
  deleteAddressRoute,
};
