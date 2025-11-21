import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

// Zod schemas
const PatientSchema = z.object({
  id: z.number().int(),
  userId: z.number().int().nullable(),
  emergencyContact: z.string().max(200).nullable(),
  createdAt: z.date(),
});

const CreatePatientSchema = z.object({
  userId: z.number().int().optional(),
  emergencyContact: z
    .string()
    .max(200, 'Emergency contact must be at most 200 characters')
    .optional(),
});

const UpdatePatientSchema = z.object({
  userId: z.number().int().optional(),
  emergencyContact: z
    .string()
    .max(200, 'Emergency contact must be at most 200 characters')
    .optional(),
});

const PatientFilterSchema = z.object({
  userId: z.coerce.number().int().optional(),
  search: z.string().optional(),
});

const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedPatientsSchema = z.object({
  patients: z.array(PatientSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const PatientsListSchema = z.object({
  patients: z.array(PatientSchema),
});

const PatientIdParam = z.object({
  id: z.coerce.number().int(),
});

// OpenAPI route definitions
const getPatientRoute = createGetRoute({
  path: '/patients/{id}',
  summary: 'Get patient by ID',
  responseSchema: PatientSchema,
  params: PatientIdParam,
  tags: ['Patients'],
});

const createPatientRoute = createPostRoute({
  path: '/patients',
  summary: 'Create new patient',
  requestSchema: CreatePatientSchema,
  responseSchema: PatientSchema,
  tags: ['Patients'],
});

const updatePatientRoute = createPutRoute({
  path: '/patients/{id}',
  summary: 'Update patient',
  requestSchema: UpdatePatientSchema,
  responseSchema: PatientSchema,
  params: PatientIdParam,
  tags: ['Patients'],
});

const deletePatientRoute = createDeleteRoute({
  path: '/patients/{id}',
  summary: 'Delete patient',
  params: PatientIdParam,
  tags: ['Patients'],
});

const listPatientsRoute = createGetRoute({
  path: '/patients',
  summary: 'List patients with pagination and filters',
  responseSchema: PaginatedPatientsSchema,
  query: z.object({
    ...PatientFilterSchema.shape,
    ...PaginationSchema.shape,
  }),
  tags: ['Patients'],
});

export const PatientSchemas = {
  PatientSchema,
  CreatePatientSchema,
  UpdatePatientSchema,
  PatientFilterSchema,
  PaginationSchema,
  PaginatedPatientsSchema,
  PatientsListSchema,
  PatientIdParam,
  getPatientRoute,
  createPatientRoute,
  updatePatientRoute,
  deletePatientRoute,
  listPatientsRoute,
};
