import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const DoctorSchema = z.object({
  id: z.number().int(),
  specialization: z.string().max(100).nullable(),
  currentStatus: z.string().max(50).nullable(),
  consultationFee: z
    .string()
    .transform((val) => Number(val))
    .nullable(),
  createdAt: z.date(),
});

const CreateDoctorSchema = z.object({
  specialization: z.string().max(100).optional(),
  currentStatus: z.string().max(50).optional(),
  consultationFee: z.number().optional(),
});

const UpdateDoctorSchema = z.object({
  specialization: z.string().max(100).nullable().optional(),
  currentStatus: z.string().max(50).nullable().optional(),
  consultationFee: z.number().nullable().optional(),
});

const DoctorFilterSchema = z.object({
  specialization: z.string().optional(),
  currentStatus: z.string().optional(),
  search: z.string().optional(),
});

const DoctorPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt', 'specialization']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedDoctorsSchema = z.object({
  doctors: z.array(DoctorSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const DoctorsListSchema = z.object({
  doctors: z.array(DoctorSchema),
});

const DoctorIdParam = z.object({
  id: z.coerce.number().int(),
});

const getDoctorRoute = createGetRoute({
  path: '/doctors/{id}',
  summary: 'Get doctor by ID',
  responseSchema: DoctorSchema,
  params: DoctorIdParam,
  tags: ['Doctors'],
});

const createDoctorRoute = createPostRoute({
  path: '/doctors',
  summary: 'Create new doctor',
  requestSchema: CreateDoctorSchema,
  responseSchema: DoctorSchema,
  tags: ['Doctors'],
});

const updateDoctorRoute = createPutRoute({
  path: '/doctors/{id}',
  summary: 'Update doctor',
  requestSchema: UpdateDoctorSchema,
  responseSchema: DoctorSchema,
  params: DoctorIdParam,
  tags: ['Doctors'],
});

const deleteDoctorRoute = createDeleteRoute({
  path: '/doctors/{id}',
  summary: 'Delete doctor',
  params: DoctorIdParam,
  tags: ['Doctors'],
});

const listDoctorsRoute = createGetRoute({
  path: '/doctors',
  summary: 'List doctors with pagination and filters',
  responseSchema: PaginatedDoctorsSchema,
  query: z.object({
    ...DoctorFilterSchema.shape,
    ...DoctorPaginationSchema.shape,
  }),
  tags: ['Doctors'],
});

export const DoctorSchemas = {
  DoctorSchema,
  CreateDoctorSchema,
  UpdateDoctorSchema,
  DoctorFilterSchema,
  DoctorPaginationSchema,
  PaginatedDoctorsSchema,
  DoctorsListSchema,
  DoctorIdParam,
  getDoctorRoute,
  createDoctorRoute,
  updateDoctorRoute,
  deleteDoctorRoute,
  listDoctorsRoute,
};
