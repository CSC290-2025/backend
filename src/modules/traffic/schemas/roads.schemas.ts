import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

// Zod schemas
const RoadSchema = z.object({
  id: z.number().int(),
  name: z.string().nullable(),
  start_intersection_id: z.number().int().nullable(),
  end_intersection_id: z.number().int().nullable(),
  length_meters: z.number().int().nullable(),
});

const CreateRoadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  start_intersection_id: z
    .number()
    .int()
    .positive('Start intersection ID must be positive'),
  end_intersection_id: z
    .number()
    .int()
    .positive('End intersection ID must be positive'),
  length_meters: z
    .number()
    .int()
    .positive('Length must be positive')
    .optional(),
});

const UpdateRoadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  start_intersection_id: z
    .number()
    .int()
    .positive('Start intersection ID must be positive')
    .optional(),
  end_intersection_id: z
    .number()
    .int()
    .positive('End intersection ID must be positive')
    .optional(),
  length_meters: z
    .number()
    .int()
    .positive('Length must be positive')
    .optional(),
});

const RoadFilterSchema = z.object({
  name: z.string().optional(),
  start_intersection_id: z.coerce.number().int().optional(),
  end_intersection_id: z.coerce.number().int().optional(),
  min_length: z.coerce.number().int().optional(),
  max_length: z.coerce.number().int().optional(),
});

const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['name', 'length_meters', 'id']).default('id'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedRoadsSchema = z.object({
  roads: z.array(RoadSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const RoadsListSchema = z.object({
  roads: z.array(RoadSchema),
});

const RoadStatsSchema = z.object({
  stats: z.object({
    total_roads: z.number(),
    total_length: z.number(),
    avg_length: z.number(),
    min_length: z.number(),
    max_length: z.number(),
  }),
});

const RoadIdParam = z.object({
  id: z.coerce.number().int(),
});

const IntersectionIdParam = z.object({
  intersectionId: z.coerce.number().int(),
});

// OpenAPI route definitions
const getRoadRoute = createGetRoute({
  path: '/roads/{id}',
  summary: 'Get road by ID',
  responseSchema: RoadSchema,
  params: RoadIdParam,
  tags: ['Roads'],
});

const listRoadsRoute = createGetRoute({
  path: '/roads',
  summary: 'List roads with pagination and filters',
  responseSchema: PaginatedRoadsSchema,
  query: z.object({
    ...RoadFilterSchema.shape,
    ...PaginationSchema.shape,
  }),
  tags: ['Roads'],
});

const getRoadsByIntersectionRoute = createGetRoute({
  path: '/roads/intersection/{intersectionId}',
  summary: 'Get roads connected to an intersection',
  responseSchema: RoadsListSchema,
  params: IntersectionIdParam,
  tags: ['Roads'],
});

// Detailed road response includes road + intersection details and other roads at those intersections
const IntersectionDetailSchema = z.object({
  id: z.number().int(),
  // location is a GeoJSON point or null
  location: z.any().nullable(),
  otherRoads: z.array(RoadSchema),
});

const RoadDetailResponseSchema = z.object({
  road: RoadSchema,
  startIntersection: IntersectionDetailSchema.nullable(),
  endIntersection: IntersectionDetailSchema.nullable(),
});

const getRoadDetailsRoute = createGetRoute({
  path: '/roads/{id}/details',
  summary:
    'Get road details including start/end intersections and other roads there',
  responseSchema: RoadDetailResponseSchema,
  params: RoadIdParam,
  tags: ['Roads'],
});

const getRoadStatsRoute = createGetRoute({
  path: '/roads/stats',
  summary: 'Get road statistics',
  responseSchema: RoadStatsSchema,
  tags: ['Roads', 'Statistics'],
});

const adminCreateRoadRoute = createPostRoute({
  path: '/admin/roads',
  summary: 'Create new road (Admin)',
  requestSchema: CreateRoadSchema,
  responseSchema: RoadSchema,
  tags: ['Admin', 'Roads'],
});

const adminUpdateRoadRoute = createPutRoute({
  path: '/admin/roads/{id}',
  summary: 'Update road (Admin)',
  requestSchema: UpdateRoadSchema,
  responseSchema: RoadSchema,
  params: RoadIdParam,
  tags: ['Admin', 'Roads'],
});

const adminDeleteRoadRoute = createDeleteRoute({
  path: '/admin/roads/{id}',
  summary: 'Delete road (Admin)',
  params: RoadIdParam,
  tags: ['Admin', 'Roads'],
});

export const RoadSchemas = {
  RoadSchema,
  CreateRoadSchema,
  UpdateRoadSchema,
  RoadFilterSchema,
  PaginationSchema,
  PaginatedRoadsSchema,
  RoadsListSchema,
  RoadStatsSchema,
  RoadIdParam,
  IntersectionIdParam,
  getRoadRoute,
  listRoadsRoute,
  getRoadsByIntersectionRoute,
  getRoadStatsRoute,
  getRoadDetailsRoute,
  adminCreateRoadRoute,
  adminUpdateRoadRoute,
  adminDeleteRoadRoute,
};
