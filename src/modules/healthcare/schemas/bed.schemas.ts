import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const BedSchema = z.object({
  id: z.number().int(),
  facilityId: z.number().int().nullable(),
  bedNumber: z.string().max(50).nullable(),
  bedType: z.string().max(50).nullable(),
  status: z.string().max(50).nullable(),
  patientId: z.number().int().nullable(),
  admissionDate: z.date().nullable(),
  createdAt: z.date(),
});

const CreateBedSchema = z.object({
  facilityId: z.number().int().optional(),
  bedNumber: z.string().max(50).optional(),
  bedType: z.string().max(50).optional(),
  status: z.string().max(50).optional(),
  patientId: z.number().int().optional(),
  admissionDate: z.coerce.date().optional(),
});

const UpdateBedSchema = z.object({
  facilityId: z.number().int().nullable().optional(),
  bedNumber: z.string().max(50).nullable().optional(),
  bedType: z.string().max(50).nullable().optional(),
  status: z.string().max(50).nullable().optional(),
  patientId: z.number().int().nullable().optional(),
  admissionDate: z.coerce.date().nullable().optional(),
});

const BedFilterSchema = z.object({
  facilityId: z.coerce.number().int().optional(),
  patientId: z.coerce.number().int().optional(),
  status: z.string().optional(),
  bedType: z.string().optional(),
  search: z.string().optional(),
});

const BedPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['id', 'createdAt', 'bedNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedBedsSchema = z.object({
  beds: z.array(BedSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const BedsListSchema = z.object({
  beds: z.array(BedSchema),
});

const BedIdParam = z.object({
  id: z.coerce.number().int(),
});

const getBedRoute = createGetRoute({
  path: '/beds/{id}',
  summary: 'Get bed by ID',
  responseSchema: BedSchema,
  params: BedIdParam,
  tags: ['Beds'],
});

const createBedRoute = createPostRoute({
  path: '/beds',
  summary: 'Create new bed',
  requestSchema: CreateBedSchema,
  responseSchema: BedSchema,
  tags: ['Beds'],
});

const updateBedRoute = createPutRoute({
  path: '/beds/{id}',
  summary: 'Update bed',
  requestSchema: UpdateBedSchema,
  responseSchema: BedSchema,
  params: BedIdParam,
  tags: ['Beds'],
});

const deleteBedRoute = createDeleteRoute({
  path: '/beds/{id}',
  summary: 'Delete bed',
  params: BedIdParam,
  tags: ['Beds'],
});

const listBedsRoute = createGetRoute({
  path: '/beds',
  summary: 'List beds with pagination and filters',
  responseSchema: PaginatedBedsSchema,
  query: z.object({
    ...BedFilterSchema.shape,
    ...BedPaginationSchema.shape,
  }),
  tags: ['Beds'],
});

export const BedSchemas = {
  BedSchema,
  CreateBedSchema,
  UpdateBedSchema,
  BedFilterSchema,
  BedPaginationSchema,
  PaginatedBedsSchema,
  BedsListSchema,
  BedIdParam,
  getBedRoute,
  createBedRoute,
  updateBedRoute,
  deleteBedRoute,
  listBedsRoute,
};
