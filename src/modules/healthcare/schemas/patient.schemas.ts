import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { AppointmentSchemas } from './appointment.schemas';

// Helper schema for appointment history JSON
const AppointmentHistoryItemSchema = z
  .object({
    id: z.number(),
    date: z.string(),
    type: z.string(),
    status: z.string(),
    // Add other fields as needed based on actual JSON structure
  })
  .passthrough();

// Zod schemas
const PatientSchema = z.object({
  id: z.number().int(),
  emergencyContact: z.string().max(200).nullable(),
  createdAt: z.date(),
  dateOfBirth: z.date().nullable(),
  bloodType: z.string().max(5).nullable(),
  totalPayments: z
    .string()
    .transform((val) => Number(val))
    .nullable(),
  appointmentHistory: z.array(AppointmentSchemas.AppointmentSchema).default([]),
});

const CreatePatientSchema = z.object({
  emergencyContact: z.string().max(200).optional(),
  dateOfBirth: z.coerce.date().optional(),
  bloodType: z.string().max(5).optional(),
  totalPayments: z.number().optional(),
});

const UpdatePatientSchema = z.object({
  emergencyContact: z.string().max(200).nullable().optional(),
  dateOfBirth: z.coerce.date().nullable().optional(),
  bloodType: z.string().max(5).nullable().optional(),
  totalPayments: z.number().nullable().optional(),
});

const PatientFilterSchema = z.object({
  bloodType: z.string().optional(),
  search: z.string().optional(),
});

const PatientPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt', 'dateOfBirth']).default('createdAt'),
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
    ...PatientPaginationSchema.shape,
  }),
  tags: ['Patients'],
});

export const PatientSchemas = {
  PatientSchema,
  CreatePatientSchema,
  UpdatePatientSchema,
  PatientFilterSchema,
  PatientPaginationSchema,
  PaginatedPatientsSchema,
  PatientsListSchema,
  PatientIdParam,
  getPatientRoute,
  createPatientRoute,
  updatePatientRoute,
  deletePatientRoute,
  listPatientsRoute,
};
