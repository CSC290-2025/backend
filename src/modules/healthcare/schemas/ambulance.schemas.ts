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

const AmbulanceSchema = z.object({
  id: z.number().int(),
  vehicleNumber: z.string().max(50),
  status: z.string().max(50).nullable(),
  currentLocation: GeoPointSchema.nullable(),
  baseFacilityId: z.number().int().nullable(),
  createdAt: z.date(),
});

const CreateAmbulanceSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, 'Vehicle number is required')
    .max(50, 'Vehicle number must be at most 50 characters'),
  status: z.string().max(50, 'Status must be at most 50 characters').optional(),
  currentLocation: GeoPointSchema.optional(),
  baseFacilityId: z.number().int().optional(),
});

const UpdateAmbulanceSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, 'Vehicle number is required')
    .max(50, 'Vehicle number must be at most 50 characters')
    .optional(),
  status: z.string().max(50, 'Status must be at most 50 characters').optional(),
  currentLocation: GeoPointSchema.nullable().optional(),
  baseFacilityId: z.number().int().nullable().optional(),
});

const AmbulanceFilterSchema = z.object({
  status: z.string().optional(),
  baseFacilityId: z.coerce.number().int().optional(),
  search: z.string().optional(),
});

const AmbulancePaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt', 'vehicleNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedAmbulancesSchema = z.object({
  ambulances: z.array(AmbulanceSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const AmbulancesListSchema = z.object({
  ambulances: z.array(AmbulanceSchema),
});

const AmbulanceIdParam = z.object({
  id: z.coerce.number().int(),
});

const getAmbulanceRoute = createGetRoute({
  path: '/ambulances/{id}',
  summary: 'Get ambulance by ID',
  responseSchema: AmbulanceSchema,
  params: AmbulanceIdParam,
  tags: ['Ambulances'],
});

const createAmbulanceRoute = createPostRoute({
  path: '/ambulances',
  summary: 'Create new ambulance',
  requestSchema: CreateAmbulanceSchema,
  responseSchema: AmbulanceSchema,
  tags: ['Ambulances'],
});

const updateAmbulanceRoute = createPutRoute({
  path: '/ambulances/{id}',
  summary: 'Update ambulance',
  requestSchema: UpdateAmbulanceSchema,
  responseSchema: AmbulanceSchema,
  params: AmbulanceIdParam,
  tags: ['Ambulances'],
});

const deleteAmbulanceRoute = createDeleteRoute({
  path: '/ambulances/{id}',
  summary: 'Delete ambulance',
  params: AmbulanceIdParam,
  tags: ['Ambulances'],
});

const listAmbulancesRoute = createGetRoute({
  path: '/ambulances',
  summary: 'List ambulances with pagination and filters',
  responseSchema: PaginatedAmbulancesSchema,
  query: z.object({
    ...AmbulanceFilterSchema.shape,
    ...AmbulancePaginationSchema.shape,
  }),
  tags: ['Ambulances'],
});

export const AmbulanceSchemas = {
  GeoPointSchema,
  AmbulanceSchema,
  CreateAmbulanceSchema,
  UpdateAmbulanceSchema,
  AmbulanceFilterSchema,
  AmbulancePaginationSchema,
  PaginatedAmbulancesSchema,
  AmbulancesListSchema,
  AmbulanceIdParam,
  getAmbulanceRoute,
  createAmbulanceRoute,
  updateAmbulanceRoute,
  deleteAmbulanceRoute,
  listAmbulancesRoute,
};
