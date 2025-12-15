import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const FacilitySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  facilityType: z.string().nullable(),
  addressId: z.number().int().nullable(),
  phone: z.string().nullable(),
  emergencyServices: z.boolean().nullable(),
  departmentId: z.number().int().nullable(),
  createdAt: z.date(),
});

const CreateFacilitySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters'),
  facilityType: z
    .string()
    .max(100, 'Facility type must be at most 100 characters')
    .optional(),
  addressId: z.number().int().optional(),
  phone: z.string().max(20, 'Phone must be at most 20 characters').optional(),
  emergencyServices: z.boolean().optional(),
  departmentId: z.number().int().optional(),
});

const UpdateFacilitySchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character')
    .max(255, 'Name must be at most 255 characters')
    .optional(),
  facilityType: z
    .string()
    .max(100, 'Facility type must be at most 100 characters')
    .optional(),
  addressId: z.number().int().optional(),
  phone: z.string().max(20, 'Phone must be at most 20 characters').optional(),
  emergencyServices: z.boolean().optional(),
  departmentId: z.number().int().optional(),
});

const FacilityFilterSchema = z.object({
  addressId: z.coerce.number().int().optional(),
  departmentId: z.coerce.number().int().optional(),
  facilityType: z.string().optional(),
  emergencyServices: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

const PaginationSchema = z.object({
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
    ...PaginationSchema.shape,
  }),
  tags: ['Facilities'],
});

export const FacilitySchemas = {
  FacilitySchema,
  CreateFacilitySchema,
  UpdateFacilitySchema,
  FacilityFilterSchema,
  PaginationSchema,
  PaginatedFacilitiesSchema,
  FacilitiesListSchema,
  FacilityIdParam,
  getFacilityRoute,
  createFacilityRoute,
  updateFacilityRoute,
  deleteFacilityRoute,
  listFacilitiesRoute,
};
