import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

// Zod schemas
const TrafficEmergencySchema = z.object({
  id: z.number().int(),
  user_id: z.number().int().nullable(),
  accident_location: z.any().nullable(), // geometry type
  destination_hospital: z.string().nullable(),
  status: z.string().nullable(),
  ambulance_vehicle_id: z.number().int().nullable(),
  created_at: z.date(),
});

const CreateTrafficEmergencySchema = z.object({
  user_id: z.number().int().positive('User ID must be positive'),
  accident_location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  destination_hospital: z
    .string()
    .min(2, 'Hospital name must be at least 2 characters'),
  status: z
    .enum([
      'pending',
      'dispatched',
      'in_transit',
      'arrived',
      'completed',
      'cancelled',
    ])
    .default('pending'),
  ambulance_vehicle_id: z.number().int().positive().optional(),
});

const UpdateTrafficEmergencySchema = z.object({
  accident_location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
  destination_hospital: z
    .string()
    .min(2, 'Hospital name must be at least 2 characters')
    .optional(),
  status: z
    .enum([
      'pending',
      'dispatched',
      'in_transit',
      'arrived',
      'completed',
      'cancelled',
    ])
    .optional(),
  ambulance_vehicle_id: z.number().int().positive().optional(),
});

const TrafficEmergencyFilterSchema = z.object({
  user_id: z.coerce.number().int().optional(),
  status: z
    .enum([
      'pending',
      'dispatched',
      'in_transit',
      'arrived',
      'completed',
      'cancelled',
    ])
    .optional(),
  ambulance_vehicle_id: z.coerce.number().int().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['created_at', 'status', 'id']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedTrafficEmergenciesSchema = z.object({
  emergencies: z.array(TrafficEmergencySchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const TrafficEmergenciesListSchema = z.object({
  emergencies: z.array(TrafficEmergencySchema),
});

const TrafficEmergencyStatsSchema = z.object({
  stats: z.object({
    total_emergencies: z.number(),
    pending: z.number(),
    dispatched: z.number(),
    in_transit: z.number(),
    arrived: z.number(),
    completed: z.number(),
    cancelled: z.number(),
  }),
});

const TrafficEmergencyIdParam = z.object({
  id: z.coerce.number().int(),
});

const UserIdParam = z.object({
  userId: z.coerce.number().int(),
});

const StatusParam = z.object({
  status: z.enum([
    'pending',
    'dispatched',
    'in_transit',
    'arrived',
    'completed',
    'cancelled',
  ]),
});

// OpenAPI route definitions
const getTrafficEmergencyRoute = createGetRoute({
  path: '/traffic-emergencies/{id}',
  summary: 'Get traffic emergency by ID',
  responseSchema: TrafficEmergencySchema,
  params: TrafficEmergencyIdParam,
  tags: ['Traffic Emergencies'],
});

const listTrafficEmergenciesRoute = createGetRoute({
  path: '/traffic-emergencies',
  summary: 'List traffic emergencies with pagination and filters',
  responseSchema: PaginatedTrafficEmergenciesSchema,
  query: z.object({
    ...TrafficEmergencyFilterSchema.shape,
    ...PaginationSchema.shape,
  }),
  tags: ['Traffic Emergencies'],
});

const getTrafficEmergenciesByUserRoute = createGetRoute({
  path: '/traffic-emergencies/user/{userId}',
  summary: 'Get traffic emergencies by user',
  responseSchema: TrafficEmergenciesListSchema,
  params: UserIdParam,
  tags: ['Traffic Emergencies'],
});

const getTrafficEmergenciesByStatusRoute = createGetRoute({
  path: '/traffic-emergencies/status/{status}',
  summary: 'Get traffic emergencies by status',
  responseSchema: TrafficEmergenciesListSchema,
  params: StatusParam,
  tags: ['Traffic Emergencies'],
});

const getTrafficEmergencyStatsRoute = createGetRoute({
  path: '/traffic-emergencies/stats',
  summary: 'Get traffic emergency statistics',
  responseSchema: TrafficEmergencyStatsSchema,
  tags: ['Traffic Emergencies', 'Statistics'],
});

const createTrafficEmergencyRoute = createPostRoute({
  path: '/traffic-emergencies',
  summary: 'Create new traffic emergency',
  requestSchema: CreateTrafficEmergencySchema,
  responseSchema: TrafficEmergencySchema,
  tags: ['Traffic Emergencies'],
});

const adminUpdateTrafficEmergencyRoute = createPutRoute({
  path: '/admin/traffic-emergencies/{id}',
  summary: 'Update traffic emergency (Admin)',
  requestSchema: UpdateTrafficEmergencySchema,
  responseSchema: TrafficEmergencySchema,
  params: TrafficEmergencyIdParam,
  tags: ['Admin', 'Traffic Emergencies'],
});

const adminDeleteTrafficEmergencyRoute = createDeleteRoute({
  path: '/admin/traffic-emergencies/{id}',
  summary: 'Delete traffic emergency (Admin)',
  params: TrafficEmergencyIdParam,
  tags: ['Admin', 'Traffic Emergencies'],
});

export const TrafficEmergencySchemas = {
  TrafficEmergencySchema,
  CreateTrafficEmergencySchema,
  UpdateTrafficEmergencySchema,
  TrafficEmergencyFilterSchema,
  PaginationSchema,
  PaginatedTrafficEmergenciesSchema,
  TrafficEmergenciesListSchema,
  TrafficEmergencyStatsSchema,
  TrafficEmergencyIdParam,
  UserIdParam,
  StatusParam,
  getTrafficEmergencyRoute,
  listTrafficEmergenciesRoute,
  getTrafficEmergenciesByUserRoute,
  getTrafficEmergenciesByStatusRoute,
  getTrafficEmergencyStatsRoute,
  createTrafficEmergencyRoute,
  adminUpdateTrafficEmergencyRoute,
  adminDeleteTrafficEmergencyRoute,
};
