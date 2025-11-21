// source/schemas/intersection.schemas.ts
import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

// Location schema (same as traffic lights)
const LocationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
});

// Main intersection schema (matches database exactly)
const IntersectionSchema = z.object({
  id: z.number().int().positive(),
  location: LocationSchema.nullable(),
});

// Create schema (only location is needed)
const CreateIntersectionSchema = z.object({
  location: LocationSchema,
});

// Update schema (only location can be updated)
const UpdateIntersectionSchema = z.object({
  location: LocationSchema,
});

// Traffic light summary (for intersection details)
const TrafficLightSummarySchema = z.object({
  id: z.number(),
  status: z.number().nullable(),
  current_color: z.number().nullable(),
  density_level: z.number().nullable(),
  auto_mode: z.boolean().nullable(),
  ip_address: z.string().nullable(),
  location: LocationSchema.nullable(),
});

// Road summary (for intersection details)
const RoadSummarySchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  length_meters: z.number().nullable(),
});

// Intersection with related data
const IntersectionWithLightsSchema = z.object({
  id: z.number(),
  location: LocationSchema.nullable(),
  traffic_lights: z.array(TrafficLightSummarySchema),
  roads_starting: z.array(RoadSummarySchema),
  roads_ending: z.array(RoadSummarySchema),
  stats: z.object({
    totalLights: z.number(),
    activeLights: z.number(),
    averageDensity: z.number(),
    totalRoads: z.number(),
  }),
});

// List response
const IntersectionListSchema = z.object({
  intersections: z.array(IntersectionSchema),
  total: z.number().int(),
});

const IntersectionWithLightsListSchema = z.object({
  intersections: z.array(IntersectionWithLightsSchema),
  total: z.number().int(),
});

// Params
const IntersectionIdParam = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

// Query filters
const IntersectionFilterSchema = z.object({
  min_lights: z.coerce.number().int().min(0).max(4).optional(),
  max_lights: z.coerce.number().int().min(0).max(4).optional(),
  has_roads: z.coerce.boolean().optional(),
});

// Nearby query
const NearbyIntersectionsQuerySchema = z.object({
  lng: z.coerce.number().min(-180).max(180),
  lat: z.coerce.number().min(-90).max(90),
  radius: z.coerce.number().positive().default(5000), // 5km default
});

// OpenAPI Routes
const getIntersectionRoute = createGetRoute({
  path: '/intersections/{id}',
  summary: 'Get intersection by ID',
  responseSchema: IntersectionWithLightsSchema,
  params: IntersectionIdParam,
  tags: ['Intersections'],
});

const createIntersectionRoute = createPostRoute({
  path: '/intersections',
  summary: 'Create new intersection',
  requestSchema: CreateIntersectionSchema,
  responseSchema: IntersectionSchema,
  tags: ['Intersections'],
});

const updateIntersectionRoute = createPutRoute({
  path: '/intersections/{id}',
  summary: 'Update intersection location',
  requestSchema: UpdateIntersectionSchema,
  responseSchema: IntersectionSchema,
  params: IntersectionIdParam,
  tags: ['Intersections'],
});

const deleteIntersectionRoute = createDeleteRoute({
  path: '/intersections/{id}',
  summary: 'Delete intersection',
  params: IntersectionIdParam,
  tags: ['Intersections'],
});

const listIntersectionsRoute = createGetRoute({
  path: '/intersections',
  summary: 'List all intersections',
  responseSchema: IntersectionListSchema,
  query: IntersectionFilterSchema,
  tags: ['Intersections'],
});

const listIntersectionsWithLightsRoute = createGetRoute({
  path: '/intersections/detailed',
  summary: 'List intersections with traffic lights and roads',
  responseSchema: IntersectionWithLightsListSchema,
  query: IntersectionFilterSchema,
  tags: ['Intersections'],
});

const getNearbyIntersectionsRoute = createGetRoute({
  path: '/intersections/nearby',
  summary: 'Find nearby intersections',
  responseSchema: IntersectionListSchema,
  query: NearbyIntersectionsQuerySchema,
  tags: ['Intersections'],
});

const getIntersectionStatsRoute = createGetRoute({
  path: '/intersections/{id}/stats',
  summary: 'Get intersection statistics',
  responseSchema: z.object({
    intersection_id: z.number(),
    location: LocationSchema.nullable(),
    stats: z.object({
      totalLights: z.number(),
      activeLights: z.number(),
      averageDensity: z.number(),
      totalRoads: z.number(),
      averageWaitTime: z.number(),
      peakHours: z.array(z.number()),
    }),
  }),
  params: IntersectionIdParam,
  tags: ['Intersections', 'Statistics'],
});

export const IntersectionSchemas = {
  // Base schemas
  LocationSchema,
  IntersectionSchema,
  CreateIntersectionSchema,
  UpdateIntersectionSchema,
  TrafficLightSummarySchema,
  RoadSummarySchema,
  IntersectionWithLightsSchema,

  // Response schemas
  IntersectionListSchema,
  IntersectionWithLightsListSchema,

  // Params & Query
  IntersectionIdParam,
  IntersectionFilterSchema,
  NearbyIntersectionsQuerySchema,

  // Routes
  getIntersectionRoute,
  createIntersectionRoute,
  updateIntersectionRoute,
  deleteIntersectionRoute,
  listIntersectionsRoute,
  listIntersectionsWithLightsRoute,
  getNearbyIntersectionsRoute,
  getIntersectionStatsRoute,
};
