import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const EmergencyCallSchema = z.object({
  id: z.number().int(),
  patientId: z.number().int().nullable(),
  callerPhone: z.string().max(20).nullable(),
  emergencyType: z.string().max(100),
  severity: z.string().max(50).nullable(),
  addressId: z.number().int().nullable(),
  ambulanceId: z.number().int().nullable(),
  facilityId: z.number().int().nullable(),
  status: z.string().max(50).nullable(),
  createdAt: z.date(),
});

const CreateEmergencyCallSchema = z.object({
  patientId: z.number().int().optional(),
  callerPhone: z
    .string()
    .max(20, 'Caller phone must be at most 20 characters')
    .optional(),
  emergencyType: z
    .string()
    .min(1, 'Emergency type is required')
    .max(100, 'Emergency type must be at most 100 characters'),
  severity: z
    .string()
    .max(50, 'Severity must be at most 50 characters')
    .optional(),
  addressId: z.number().int().optional(),
  ambulanceId: z.number().int().optional(),
  facilityId: z.number().int().optional(),
  status: z.string().max(50, 'Status must be at most 50 characters').optional(),
});

const UpdateEmergencyCallSchema = z.object({
  patientId: z.number().int().nullable().optional(),
  callerPhone: z
    .string()
    .max(20, 'Caller phone must be at most 20 characters')
    .nullable()
    .optional(),
  emergencyType: z
    .string()
    .min(1, 'Emergency type is required')
    .max(100, 'Emergency type must be at most 100 characters')
    .optional(),
  severity: z
    .string()
    .max(50, 'Severity must be at most 50 characters')
    .nullable()
    .optional(),
  addressId: z.number().int().nullable().optional(),
  ambulanceId: z.number().int().nullable().optional(),
  facilityId: z.number().int().nullable().optional(),
  status: z
    .string()
    .max(50, 'Status must be at most 50 characters')
    .nullable()
    .optional(),
});

const EmergencyCallFilterSchema = z.object({
  patientId: z.coerce.number().int().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  emergencyType: z.string().optional(),
  ambulanceId: z.coerce.number().int().optional(),
  facilityId: z.coerce.number().int().optional(),
  search: z.string().optional(),
});

const EmergencyCallPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedEmergencyCallsSchema = z.object({
  emergencyCalls: z.array(EmergencyCallSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const EmergencyCallsListSchema = z.object({
  emergencyCalls: z.array(EmergencyCallSchema),
});

const EmergencyCallIdParam = z.object({
  id: z.coerce.number().int(),
});

const getEmergencyCallRoute = createGetRoute({
  path: '/emergency-calls/{id}',
  summary: 'Get emergency call by ID',
  responseSchema: EmergencyCallSchema,
  params: EmergencyCallIdParam,
  tags: ['Emergency Calls'],
});

const createEmergencyCallRoute = createPostRoute({
  path: '/emergency-calls',
  summary: 'Create new emergency call',
  requestSchema: CreateEmergencyCallSchema,
  responseSchema: EmergencyCallSchema,
  tags: ['Emergency Calls'],
});

const updateEmergencyCallRoute = createPutRoute({
  path: '/emergency-calls/{id}',
  summary: 'Update emergency call',
  requestSchema: UpdateEmergencyCallSchema,
  responseSchema: EmergencyCallSchema,
  params: EmergencyCallIdParam,
  tags: ['Emergency Calls'],
});

const deleteEmergencyCallRoute = createDeleteRoute({
  path: '/emergency-calls/{id}',
  summary: 'Delete emergency call',
  params: EmergencyCallIdParam,
  tags: ['Emergency Calls'],
});

const listEmergencyCallsRoute = createGetRoute({
  path: '/emergency-calls',
  summary: 'List emergency calls with pagination and filters',
  responseSchema: PaginatedEmergencyCallsSchema,
  query: z.object({
    ...EmergencyCallFilterSchema.shape,
    ...EmergencyCallPaginationSchema.shape,
  }),
  tags: ['Emergency Calls'],
});

export const EmergencyCallSchemas = {
  EmergencyCallSchema,
  CreateEmergencyCallSchema,
  UpdateEmergencyCallSchema,
  EmergencyCallFilterSchema,
  EmergencyCallPaginationSchema,
  PaginatedEmergencyCallsSchema,
  EmergencyCallsListSchema,
  EmergencyCallIdParam,
  getEmergencyCallRoute,
  createEmergencyCallRoute,
  updateEmergencyCallRoute,
  deleteEmergencyCallRoute,
  listEmergencyCallsRoute,
};
