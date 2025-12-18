import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const DepartmentSchema = z.object({
  id: z.number().int(),
  name: z.string().max(255),
  createdAt: z.date(),
});

const CreateDepartmentSchema = z.object({
  name: z.string().min(1).max(255),
});

const UpdateDepartmentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

const DepartmentFilterSchema = z.object({
  search: z.string().optional(),
});

const DepartmentPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['id', 'createdAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const PaginatedDepartmentsSchema = z.object({
  departments: z.array(DepartmentSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

const DepartmentIdParam = z.object({
  id: z.coerce.number().int(),
});

const getDepartmentRoute = createGetRoute({
  path: '/departments/{id}',
  summary: 'Get department by ID',
  responseSchema: DepartmentSchema,
  params: DepartmentIdParam,
  tags: ['Departments'],
});

const createDepartmentRoute = createPostRoute({
  path: '/departments',
  summary: 'Create new department',
  requestSchema: CreateDepartmentSchema,
  responseSchema: DepartmentSchema,
  tags: ['Departments'],
});

const updateDepartmentRoute = createPutRoute({
  path: '/departments/{id}',
  summary: 'Update department',
  requestSchema: UpdateDepartmentSchema,
  responseSchema: DepartmentSchema,
  params: DepartmentIdParam,
  tags: ['Departments'],
});

const deleteDepartmentRoute = createDeleteRoute({
  path: '/departments/{id}',
  summary: 'Delete department',
  params: DepartmentIdParam,
  tags: ['Departments'],
});

const listDepartmentsRoute = createGetRoute({
  path: '/departments',
  summary: 'List departments with pagination and filters',
  responseSchema: PaginatedDepartmentsSchema,
  query: z.object({
    ...DepartmentFilterSchema.shape,
    ...DepartmentPaginationSchema.shape,
  }),
  tags: ['Departments'],
});

export const DepartmentSchemas = {
  DepartmentSchema,
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
  DepartmentFilterSchema,
  DepartmentPaginationSchema,
  PaginatedDepartmentsSchema,
  DepartmentIdParam,
  getDepartmentRoute,
  createDepartmentRoute,
  updateDepartmentRoute,
  deleteDepartmentRoute,
  listDepartmentsRoute,
};
