import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const AppointmentSchema = z.object({
  id: z.number().int(),
  patientId: z.number().int().nullable(),
  facilityId: z.number().int().nullable(),
  appointmentAt: z.date().nullable(),
  type: z.string().max(50).nullable(),
  createdAt: z.date(),
  doctorId: z.number().int().nullable(),
  consultationFee: z
    .string()
    .transform((val) => Number(val))
    .nullable(),
});

const CreateAppointmentSchema = z.object({
  patientId: z.number().int().optional(),
  facilityId: z.number().int().optional(),
  appointmentAt: z.coerce.date().optional(),
  type: z.string().max(50).optional(),
  doctorId: z.number().int().optional(),
  consultationFee: z.number().optional(),
});

const UpdateAppointmentSchema = z.object({
  patientId: z.number().int().nullable().optional(),
  facilityId: z.number().int().nullable().optional(),
  appointmentAt: z.coerce.date().nullable().optional(),
  type: z.string().max(50).nullable().optional(),
  doctorId: z.number().int().nullable().optional(),
  consultationFee: z.number().nullable().optional(),
});

const AppointmentFilterSchema = z.object({
  patientId: z.coerce.number().int().optional(),
  facilityId: z.coerce.number().int().optional(),
  doctorId: z.coerce.number().int().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
});

const AppointmentPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt', 'appointmentAt']).default('appointmentAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedAppointmentsSchema = z.object({
  appointments: z.array(AppointmentSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const AppointmentsListSchema = z.object({
  appointments: z.array(AppointmentSchema),
});

const AppointmentIdParam = z.object({
  id: z.coerce.number().int(),
});

const getAppointmentRoute = createGetRoute({
  path: '/appointments/{id}',
  summary: 'Get appointment by ID',
  responseSchema: AppointmentSchema,
  params: AppointmentIdParam,
  tags: ['Appointments'],
});

const createAppointmentRoute = createPostRoute({
  path: '/appointments',
  summary: 'Create new appointment',
  requestSchema: CreateAppointmentSchema,
  responseSchema: AppointmentSchema,
  tags: ['Appointments'],
});

const updateAppointmentRoute = createPutRoute({
  path: '/appointments/{id}',
  summary: 'Update appointment',
  requestSchema: UpdateAppointmentSchema,
  responseSchema: AppointmentSchema,
  params: AppointmentIdParam,
  tags: ['Appointments'],
});

const deleteAppointmentRoute = createDeleteRoute({
  path: '/appointments/{id}',
  summary: 'Delete appointment',
  params: AppointmentIdParam,
  tags: ['Appointments'],
});

const listAppointmentsRoute = createGetRoute({
  path: '/appointments',
  summary: 'List appointments with pagination and filters',
  responseSchema: PaginatedAppointmentsSchema,
  query: z.object({
    ...AppointmentFilterSchema.shape,
    ...AppointmentPaginationSchema.shape,
  }),
  tags: ['Appointments'],
});

export const AppointmentSchemas = {
  AppointmentSchema,
  CreateAppointmentSchema,
  UpdateAppointmentSchema,
  AppointmentFilterSchema,
  AppointmentPaginationSchema,
  PaginatedAppointmentsSchema,
  AppointmentsListSchema,
  AppointmentIdParam,
  getAppointmentRoute,
  createAppointmentRoute,
  updateAppointmentRoute,
  deleteAppointmentRoute,
  listAppointmentsRoute,
};
