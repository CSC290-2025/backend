import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const PrescriptionSchema = z.object({
  id: z.number().int(),
  patientId: z.number().int(),
  prescriberUserId: z.number().int(),
  facilityId: z.number().int().nullable(),
  medicationName: z.string().max(255),
  quantity: z.number().int().nonnegative(),
  status: z.string().max(50).nullable(),
  createdAt: z.date(),
});

const CreatePrescriptionSchema = z.object({
  patientId: z.number().int(),
  prescriberUserId: z.number().int(),
  facilityId: z.number().int().optional(),
  medicationName: z
    .string()
    .min(1, 'Medication name is required')
    .max(255, 'Medication name must be at most 255 characters'),
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
  status: z.string().max(50, 'Status must be at most 50 characters').optional(),
});

const UpdatePrescriptionSchema = z.object({
  patientId: z.number().int().optional(),
  prescriberUserId: z.number().int().optional(),
  facilityId: z.number().int().optional(),
  medicationName: z
    .string()
    .min(1, 'Medication name is required')
    .max(255, 'Medication name must be at most 255 characters')
    .optional(),
  quantity: z
    .number()
    .int()
    .nonnegative('Quantity cannot be negative')
    .optional(),
  status: z.string().max(50, 'Status must be at most 50 characters').optional(),
});

const PrescriptionFilterSchema = z.object({
  patientId: z.coerce.number().int().optional(),
  prescriberUserId: z.coerce.number().int().optional(),
  facilityId: z.coerce.number().int().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

const PrescriptionPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt', 'medicationName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedPrescriptionsSchema = z.object({
  prescriptions: z.array(PrescriptionSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const PrescriptionsListSchema = z.object({
  prescriptions: z.array(PrescriptionSchema),
});

const PrescriptionIdParam = z.object({
  id: z.coerce.number().int(),
});

const getPrescriptionRoute = createGetRoute({
  path: '/prescriptions/{id}',
  summary: 'Get prescription by ID',
  responseSchema: PrescriptionSchema,
  params: PrescriptionIdParam,
  tags: ['Prescriptions'],
});

const createPrescriptionRoute = createPostRoute({
  path: '/prescriptions',
  summary: 'Create new prescription',
  requestSchema: CreatePrescriptionSchema,
  responseSchema: PrescriptionSchema,
  tags: ['Prescriptions'],
});

const updatePrescriptionRoute = createPutRoute({
  path: '/prescriptions/{id}',
  summary: 'Update prescription',
  requestSchema: UpdatePrescriptionSchema,
  responseSchema: PrescriptionSchema,
  params: PrescriptionIdParam,
  tags: ['Prescriptions'],
});

const deletePrescriptionRoute = createDeleteRoute({
  path: '/prescriptions/{id}',
  summary: 'Delete prescription',
  params: PrescriptionIdParam,
  tags: ['Prescriptions'],
});

const listPrescriptionsRoute = createGetRoute({
  path: '/prescriptions',
  summary: 'List prescriptions with pagination and filters',
  responseSchema: PaginatedPrescriptionsSchema,
  query: z.object({
    ...PrescriptionFilterSchema.shape,
    ...PrescriptionPaginationSchema.shape,
  }),
  tags: ['Prescriptions'],
});

export const PrescriptionSchemas = {
  PrescriptionSchema,
  CreatePrescriptionSchema,
  UpdatePrescriptionSchema,
  PrescriptionFilterSchema,
  PrescriptionPaginationSchema,
  PaginatedPrescriptionsSchema,
  PrescriptionsListSchema,
  PrescriptionIdParam,
  getPrescriptionRoute,
  createPrescriptionRoute,
  updatePrescriptionRoute,
  deletePrescriptionRoute,
  listPrescriptionsRoute,
};
