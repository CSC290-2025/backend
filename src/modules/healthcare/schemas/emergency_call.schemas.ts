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
  emergencyType: z.string().max(100).nullable(),
  severity: z.string().max(50).nullable(),
  addressId: z.number().int().nullable(),
  ambulanceId: z.number().int().nullable(),
  facilityId: z.number().int().nullable(),
  status: z.string().max(50).nullable(),
  createdAt: z.date(),
});

const CreateEmergencyCallSchema = z.object({
  patientId: z.number().int().optional(),
  callerPhone: z.string().max(20).optional(),
  emergencyType: z.string().max(100).optional(),
  severity: z.string().max(50).optional(),
  addressId: z.number().int().optional(),
  ambulanceId: z.number().int().optional(),
  facilityId: z.number().int().optional(),
  status: z.string().max(50).optional(),
});

const UpdateEmergencyCallSchema = z.object({
  patientId: z.number().int().nullable().optional(),
  callerPhone: z.string().max(20).nullable().optional(),
  emergencyType: z.string().max(100).nullable().optional(),
  severity: z.string().max(50).nullable().optional(),
  addressId: z.number().int().nullable().optional(),
  ambulanceId: z.number().int().nullable().optional(),
  facilityId: z.number().int().nullable().optional(),
  status: z.string().max(50).nullable().optional(),
});

const EmergencyCallFilterSchema = z.object({
  patientId: z.coerce.number().int().optional(),
  callerPhone: z.string().optional(),
  emergencyType: z.string().optional(),
  severity: z.string().optional(),
  addressId: z.coerce.number().int().optional(),
  ambulanceId: z.coerce.number().int().optional(),
  facilityId: z.coerce.number().int().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

const EmergencyCallPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt', 'severity']).default('createdAt'),
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
  tags: ['EmergencyCalls'],
});

const createEmergencyCallRoute = createPostRoute({
  path: '/emergency-calls',
  summary: 'Create new emergency call',
  requestSchema: CreateEmergencyCallSchema,
  responseSchema: EmergencyCallSchema,
  tags: ['EmergencyCalls'],
});

const updateEmergencyCallRoute = createPutRoute({
  path: '/emergency-calls/{id}',
  summary: 'Update emergency call',
  requestSchema: UpdateEmergencyCallSchema,
  responseSchema: EmergencyCallSchema,
  params: EmergencyCallIdParam,
  tags: ['EmergencyCalls'],
});

const deleteEmergencyCallRoute = createDeleteRoute({
  path: '/emergency-calls/{id}',
  summary: 'Delete emergency call',
  params: EmergencyCallIdParam,
  tags: ['EmergencyCalls'],
});

const listEmergencyCallsRoute = createGetRoute({
  path: '/emergency-calls',
  summary: 'List emergency calls with pagination and filters',
  responseSchema: PaginatedEmergencyCallsSchema,
  query: z.object({
    ...EmergencyCallFilterSchema.shape,
    ...EmergencyCallPaginationSchema.shape,
  }),
  tags: ['EmergencyCalls'],
});

const listAllEmergencyCallsRoute = createGetRoute({
  path: '/emergency-calls/all',
  summary: 'List all emergency calls (no pagination)',
  responseSchema: EmergencyCallsListSchema,
  query: EmergencyCallFilterSchema,
  tags: ['EmergencyCalls'],
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
