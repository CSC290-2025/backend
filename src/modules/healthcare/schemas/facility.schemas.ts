import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const GeoPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z
    .tuple([
      z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
      z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    ])
    .describe('Coordinates in [longitude, latitude] order'),
});

const AddressSchema = z.object({
  address_line: z.string().max(255),
  province: z.string().max(255),
  district: z.string().max(255),
  subdistrict: z.string().max(255),
  postal_code: z.string().max(20),
});

const FacilitySchema = z.object({
  id: z.number().int(),
  name: z.string().max(255),
  facilityType: z.string().max(100).nullable(),
  addressId: z.number().int().nullable(),
  address: AddressSchema.partial().optional(),
  phone: z.string().max(20).nullable(),
  location: GeoPointSchema.nullable(),
  emergencyServices: z.boolean().nullable(),
  departmentId: z.number().int().nullable(),
  createdAt: z.date(),
});

const CreateFacilitySchema = z.object({
  name: z.string().min(1).max(255),
  facilityType: z.string().max(100).optional(),
  addressId: z.number().int().optional(),
  address: AddressSchema.optional(),
  phone: z.string().max(20).optional(),
  location: GeoPointSchema.optional(),
  emergencyServices: z.boolean().optional(),
  departmentId: z.number().int().optional(),
});

const UpdateFacilitySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  facilityType: z.string().max(100).nullable().optional(),
  addressId: z.number().int().nullable().optional(),
  address: AddressSchema.partial().optional(),
  phone: z.string().max(20).nullable().optional(),
  location: GeoPointSchema.nullable().optional(),
  emergencyServices: z.boolean().nullable().optional(),
  departmentId: z.number().int().nullable().optional(),
});

const FacilityFilterSchema = z.object({
  addressId: z.coerce.number().int().optional(),
  facilityType: z.string().optional(),
  emergencyServices: z.coerce.boolean().optional(),
  departmentId: z.coerce.number().int().optional(),
  search: z.string().optional(),
});

const FacilityPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedFacilitiesSchema = z.object({
  facilities: z.array(FacilitySchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const FacilitiesListSchema = z.object({
  facilities: z.array(FacilitySchema),
});

const FacilityIdParam = z.object({
  id: z.coerce.number().int(),
});

const getFacilityRoute = createGetRoute({
  path: '/facilities/{id}',
  summary: 'Get facility by ID',
  responseSchema: FacilitySchema,
  params: FacilityIdParam,
  tags: ['Facilities'],
});

const createFacilityRoute = createPostRoute({
  path: '/facilities',
  summary: 'Create new facility',
  requestSchema: CreateFacilitySchema,
  responseSchema: FacilitySchema,
  tags: ['Facilities'],
});

const updateFacilityRoute = createPutRoute({
  path: '/facilities/{id}',
  summary: 'Update facility',
  requestSchema: UpdateFacilitySchema,
  responseSchema: FacilitySchema,
  params: FacilityIdParam,
  tags: ['Facilities'],
});

const deleteFacilityRoute = createDeleteRoute({
  path: '/facilities/{id}',
  summary: 'Delete facility',
  params: FacilityIdParam,
  tags: ['Facilities'],
});

const listFacilitiesRoute = createGetRoute({
  path: '/facilities',
  summary: 'List facilities with pagination and filters',
  responseSchema: PaginatedFacilitiesSchema,
  query: z.object({
    ...FacilityFilterSchema.shape,
    ...FacilityPaginationSchema.shape,
  }),
  tags: ['Facilities'],
});

export const FacilitySchemas = {
  GeoPointSchema,
  FacilitySchema,
  CreateFacilitySchema,
  UpdateFacilitySchema,
  FacilityFilterSchema,
  FacilityPaginationSchema,
  PaginatedFacilitiesSchema,
  FacilitiesListSchema,
  FacilityIdParam,
  getFacilityRoute,
  createFacilityRoute,
  updateFacilityRoute,
  deleteFacilityRoute,
  listFacilitiesRoute,
};
