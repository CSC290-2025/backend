import {
  createDeleteRoute,
  createGetRoute,
  createPostRoute,
  createPutRoute,
} from '@/utils/openapi-helpers';
import { z } from 'zod';

const addressSchema = z.object({
  id: z.int(),
  address_line: z.string().min(5).max(255),
  province: z.string().min(2).max(255),
  district: z.string().min(2).max(255),
  subdistrict: z.string().min(2).max(255),
  postal_code: z.string().min(5).max(10),
});

// const ApartmentPictureSchema = z.object({
//   id: z.number(),
//   name: z.string().nullable(),
//   file_path: z.string(),
//   apartment_id: z.number(),
// });

const ApartmentSchema = z.object({
  id: z.int(),
  name: z.string().min(2).max(255).nullable(),
  phone: z.string().max(10).nullable(),
  description: z.string().nullable(),
  electric_price: z.number().min(0).nullable(),
  water_price: z.number().min(0).nullable(),
  apartment_type: z.enum(['dormitory', 'apartment']).nullable(),
  apartment_location: z.enum(['asoke', 'prachauthit', 'phathumwan']).nullable(),
  internet: z.enum(['free', 'not_free', 'none']).nullable(),
  address_id: z.int().nullable(),
});

const ApartmentListSchema = z.array(ApartmentSchema);

const createApartmentSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().max(10),
  description: z.string().nullable(),
  apartment_type: z.enum(['dormitory', 'apartment']),
  apartment_location: z.enum(['asoke', 'prachauthit', 'phathumwan']),
  electric_price: z.number().min(0),
  water_price: z.number().min(0),
  internet: z.enum(['free', 'not_free', 'none']),
  userId: z.int(),
  address: z.object({
    address_line: z.string().min(5).max(255),
    province: z.string().min(2).max(255),
    district: z.string().min(2).max(255),
    subdistrict: z.string().min(2).max(255),
    postal_code: z.string().min(5).max(10),
  }),
});

const updateApartmentSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().max(10),
  description: z.string().nullable(),
  apartment_type: z.enum(['dormitory', 'apartment']),
  apartment_location: z.enum(['asoke', 'prachauthit', 'phathumwan']),
  electric_price: z.number().min(0),
  water_price: z.number().min(0),
  internet: z.enum(['free', 'not_free', 'none']),
  address: z
    .object({
      address_line: z.string().min(5).max(255),
      province: z.string().min(2).max(255),
      district: z.string().min(2).max(255),
      subdistrict: z.string().min(2).max(255),
      postal_code: z.string().min(5).max(10),
    })
    .optional(),
});
const ApartmentIdParam = z.object({
  id: z.coerce.number().int().positive(),
});

const ApartmentFilterSchema = z.object({
  apartment_location: z.string().nullable(),
  minPrice: z.coerce.number().nullable(),
  maxPrice: z.coerce.number().nullable(),
  search: z.string().nullable(),
});

const UpdateApartmentParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const DeleteApartmentParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

//openAPI
const CreateApartmentRoute = createPostRoute({
  path: '/apartments',
  summary: 'Create a new apartment',
  requestSchema: createApartmentSchema,
  responseSchema: ApartmentSchema,
  tags: ['Apartment'],
});

const UpdateApartmentRoute = createPutRoute({
  path: '/apartments/{id}',
  summary: 'Update an existing apartment',
  requestSchema: updateApartmentSchema,
  responseSchema: ApartmentSchema,
  params: UpdateApartmentParamsSchema,
  tags: ['Apartment'],
});
const DeleteApartmentRoute = createDeleteRoute({
  path: '/apartments/{id}',
  summary: 'Delete an existing apartment',
  params: DeleteApartmentParamsSchema,
  tags: ['Apartment'],
});

const getApartmentbyIDRoute = createGetRoute({
  path: '/apartments/{id}',
  summary: 'Get an apartment by ID',
  params: ApartmentIdParam,
  responseSchema: ApartmentSchema,
  tags: ['Apartment'],
});

const getAllApartmentsRoute = createGetRoute({
  path: '/apartments',
  summary: 'Get all apartments',
  responseSchema: z.array(ApartmentSchema),
  tags: ['Apartment'],
});

const apartmentFilterRoute = createGetRoute({
  path: '/apartments/filter',
  summary: 'Filter apartments',
  query: ApartmentFilterSchema,
  responseSchema: z.array(ApartmentSchema),
  tags: ['Apartment'],
});

export const ApartmentSchemas = {
  createApartmentSchema,
  updateApartmentSchema,
  ApartmentIdParam,
  ApartmentFilterSchema,
  ApartmentSchema,
  addressSchema,
  CreateApartmentRoute,
  UpdateApartmentRoute,
  DeleteApartmentRoute,
  getApartmentbyIDRoute,
  getAllApartmentsRoute,
  ApartmentListSchema,
  apartmentFilterRoute,
};
