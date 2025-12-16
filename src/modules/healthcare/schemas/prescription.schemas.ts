import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

// Helper schema for medicines list JSON
const MedicineItemSchema = z
  .object({
    medicineId: z.number().optional(),
    name: z.string(),
    quantity: z.number(),
    dosage: z.string().optional(),
    // Add other fields as needed
  })
  .passthrough();

const PrescriptionSchema = z.object({
  id: z.number().int(),
  patientId: z.number().int().nullable(),
  facilityId: z.number().int().nullable(),
  status: z.string().max(50).nullable(),
  createdAt: z.date(),
  medicinesList: z.any().nullable(),
  totalAmount: z
    .string()
    .transform((val) => Number(val))
    .nullable(),
});

const CreatePrescriptionSchema = z.object({
  patientId: z.number().int().optional(),
  facilityId: z.number().int().optional(),
  status: z.string().max(50).optional(),
  medicinesList: z.any().optional(),
  totalAmount: z.number().optional(),
});

const UpdatePrescriptionSchema = z.object({
  patientId: z.number().int().nullable().optional(),
  facilityId: z.number().int().nullable().optional(),
  status: z.string().max(50).nullable().optional(),
  medicinesList: z.any().nullable().optional(),
  totalAmount: z.number().nullable().optional(),
});

const PrescriptionFilterSchema = z.object({
  patientId: z.coerce.number().int().optional(),
  facilityId: z.coerce.number().int().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

const PrescriptionPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt', 'status']).default('createdAt'),
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
