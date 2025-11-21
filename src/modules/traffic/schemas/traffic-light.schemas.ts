// source/traffic/schemas/traffic-light.schemas.ts
import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { LocationSchema } from './vehicle.schemas';

// Enums
const TrafficLightColorEnum = z.enum(['RED', 'YELLOW', 'GREEN']);
const DensityLevelEnum = z.enum(['LOW', 'MODERATE', 'HIGH', 'SEVERE']);

// Base schemas matching database structure
const TrafficDensitySchema = z.object({
  level: DensityLevelEnum,
  vehicleCount: z.number().int().nonnegative(),
  speedKmh: z.number().nonnegative(),
  timestamp: z.date(),
});

const TrafficLightTimingSchema = z.object({
  greenDuration: z.number().positive(),
  yellowDuration: z.number().positive(),
  redDuration: z.number().positive(),
  totalCycle: z.number().positive(),
});

// Main entity schema - matches your database exactly
const TrafficLightSchema = z.object({
  id: z.number().int().positive(),
  intersection_id: z.number().int().positive().nullable(),
  road_id: z.number().int().positive().nullable(),
  ip_address: z.ipv4().nullable(),
  location: LocationSchema.nullable(),
  status: z.number().int().nullable(),
  current_color: z.number().int().min(1).max(3), // 1=Red, 2=Yellow, 3=Green
  density_level: z.number().int().min(1).max(4), // 1=Low, 2=Moderate, 3=High, 4=Severe
  auto_mode: z.boolean(),
  last_updated: z.coerce.date().nullable(),
  green_duration: z.number().int().nullable(),
  red_duration: z.number().int().nullable(),
  last_color: z.number().int().min(1).max(3).nullable(),
});

// Create schema - all required fields for new traffic light
const CreateTrafficLightSchema = z.object({
  intersection_id: z.number().int().positive(),
  road_id: z.number().int().positive(),
  ip_address: z.ipv4(),
  location: LocationSchema.nullable(),
  status: z.number().int().default(1),
  auto_mode: z.boolean().default(true),
  green_duration: z.number().int().optional(),
  red_duration: z.number().int().optional(),
  last_color: z.number().int().min(1).max(3).optional(),
});

// Update schema - all fields optional
const UpdateTrafficLightSchema = z.object({
  status: z.number().int().optional(),
  current_color: z.number().int().min(1).max(3).optional(),
  auto_mode: z.boolean().optional(),
  ip_address: z.ipv4().optional(),
  location: LocationSchema.nullable(),
  density_level: z.number().int().min(1).max(4).optional(),
  green_duration: z.number().int().optional(),
  red_duration: z.number().int().optional(),
  last_color: z.number().int().min(1).max(3).optional(),
});

// Response schemas
const TrafficLightStatusSchema = z.object({
  trafficLight: TrafficLightSchema,
  timing: TrafficLightTimingSchema.optional(),
  density: TrafficDensitySchema.optional(),
});

const TrafficLightListSchema = z.object({
  trafficLights: z.array(TrafficLightSchema),
  total: z.number().int(),
});

const DensityCalculationSchema = z.object({
  trafficLightId: z.number().int().positive(),
  currentDensity: TrafficDensitySchema,
  recommendedTiming: TrafficLightTimingSchema,
  calculatedAt: z.coerce.date(),
});

// Params
const TrafficLightIdParam = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

const IntersectionIdParam = z.object({
  intersection_id: z.string().regex(/^\d+$/).transform(Number),
});

const RoadIdParam = z.object({
  road_id: z.string().regex(/^\d+$/).transform(Number),
});

// Query params
const TrafficLightFilterSchema = z.object({
  intersection_id: z.coerce.number().int().positive().optional(),
  road_id: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().optional(),
  auto_mode: z.coerce.boolean().optional(),
  min_density: z.coerce.number().int().min(1).max(4).optional(),
  max_density: z.coerce.number().int().min(1).max(4).optional(),
});

// Light Request schemas
const LightRequestSchema = z.object({
  id: z.number().int().positive(),
  traffic_light_id: z.number().int().positive(),
  requested_at: z.string().datetime(),
});

const CreateLightRequestSchema = z.object({
  traffic_light_id: z.number().int().positive(),
});

// OpenAPI route definitions
const getTrafficLightRoute = createGetRoute({
  path: '/traffic-lights/{id}',
  summary: 'Get traffic light status by ID',
  responseSchema: TrafficLightStatusSchema,
  params: TrafficLightIdParam,
  tags: ['Traffic Lights'],
});

const createTrafficLightRoute = createPostRoute({
  path: '/traffic-lights',
  summary: 'Create new traffic light',
  requestSchema: CreateTrafficLightSchema,
  responseSchema: TrafficLightSchema,
  tags: ['Traffic Lights'],
});

const updateTrafficLightRoute = createPutRoute({
  path: '/traffic-lights/{id}',
  summary: 'Update traffic light configuration',
  requestSchema: UpdateTrafficLightSchema,
  responseSchema: TrafficLightSchema,
  params: TrafficLightIdParam,
  tags: ['Traffic Lights'],
});

const deleteTrafficLightRoute = createDeleteRoute({
  path: '/traffic-lights/{id}',
  summary: 'Delete traffic light',
  params: TrafficLightIdParam,
  tags: ['Traffic Lights'],
});

const listTrafficLightsRoute = createGetRoute({
  path: '/traffic-lights',
  summary: 'List all traffic lights',
  responseSchema: TrafficLightListSchema,
  query: TrafficLightFilterSchema,
  tags: ['Traffic Lights'],
});

const getTrafficLightsByIntersectionRoute = createGetRoute({
  path: '/traffic-lights/intersection/{intersection_id}',
  summary: 'Get traffic lights by intersection',
  responseSchema: TrafficLightListSchema,
  params: IntersectionIdParam,
  tags: ['Traffic Lights'],
});

const getTrafficLightsByRoadRoute = createGetRoute({
  path: '/traffic-lights/road/{road_id}',
  summary: 'Get traffic lights by road',
  responseSchema: TrafficLightListSchema,
  params: RoadIdParam,
  tags: ['Traffic Lights'],
});

const calculateDensityRoute = createGetRoute({
  path: '/traffic-lights/{id}/density',
  summary: 'Calculate traffic density and timing',
  responseSchema: DensityCalculationSchema,
  params: TrafficLightIdParam,
  tags: ['Traffic Lights', 'Density'],
});

const updateTimingRoute = createPostRoute({
  path: '/traffic-lights/{id}/timing',
  summary: 'Update traffic light timing',
  requestSchema: TrafficLightTimingSchema,
  responseSchema: TrafficLightSchema,
  //params: TrafficLightIdParam, Will add in route instead
  tags: ['Traffic Lights', 'Timing'],
});

const createLightRequestRoute = createPostRoute({
  path: '/light-requests',
  summary: 'Create light request',
  requestSchema: CreateLightRequestSchema,
  responseSchema: LightRequestSchema,
  tags: ['Light Requests'],
});

const getLightRequestsRoute = createGetRoute({
  path: '/light-requests/{id}',
  summary: 'Get light request by ID',
  responseSchema: LightRequestSchema,
  params: TrafficLightIdParam,
  tags: ['Light Requests'],
});

// Status schemas
const TrafficLightStatusDetailSchema = z.object({
  id: z.number().int().positive(),
  status: z.number().int().min(0).max(2).nullable(), // 0=normal, 1=broken/offline, 2=maintenance
  statusLabel: z.enum(['NORMAL', 'BROKEN', 'MAINTENANCE']),
  intersection_id: z.number().int().positive().nullable(),
  road_id: z.number().int().positive().nullable(),
  current_color: z.number().int().min(1).max(3),
  location: LocationSchema.nullable(),
  last_updated: z.string().nullable(),
});

const BatchStatusResponseSchema = z.object({
  trafficLights: z.array(TrafficLightStatusDetailSchema),
  total: z.number().int(),
});

const getAllStatusRoute = createGetRoute({
  path: '/traffic-lights/status',
  summary: 'Get all traffic light statuses',
  responseSchema: BatchStatusResponseSchema,
  tags: ['Status'],
});

export const TrafficLightSchemas = {
  // Base schemas
  TrafficLightColorEnum,
  DensityLevelEnum,
  TrafficDensitySchema,
  TrafficLightTimingSchema,
  TrafficLightSchema,
  CreateTrafficLightSchema,
  UpdateTrafficLightSchema,

  // Response schemas
  TrafficLightStatusSchema,
  TrafficLightListSchema,
  DensityCalculationSchema,

  // Light Request schemas
  LightRequestSchema,
  CreateLightRequestSchema,

  // Params
  TrafficLightIdParam,
  IntersectionIdParam,
  RoadIdParam,
  TrafficLightFilterSchema,

  // Routes
  getTrafficLightRoute,
  createTrafficLightRoute,
  updateTrafficLightRoute,
  deleteTrafficLightRoute,
  listTrafficLightsRoute,
  getTrafficLightsByIntersectionRoute,
  getTrafficLightsByRoadRoute,
  calculateDensityRoute,
  updateTimingRoute,
  createLightRequestRoute,
  getLightRequestsRoute,
  getAllStatusRoute,

  // Status schemas
  TrafficLightStatusDetailSchema,
  BatchStatusResponseSchema,
};
