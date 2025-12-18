import { z } from 'zod';
import {
  createGetRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

// Zod Schemas
const StaffSchema = z.object({
  id: z.number(),
  role: z.string().nullable(),
  facilityId: z.number().nullable().optional(),
  user: z
    .object({
      id: z.number(),
      email: z.string(),
      username: z.string().nullable(),
    })
    .optional(),
  createdAt: z.string().or(z.date()).nullable(),
});

const UpdateStaffRequestSchema = z.object({
  role: z.string().optional(),
  facilityId: z.number().nullable().optional(),
});

const StaffListResponseSchema = z.object({
  data: z.array(StaffSchema),
  total: z.number(),
});

const StaffResponseSchema = z.object({
  message: z.string(),
  data: StaffSchema.optional(),
});

const StaffIdParam = z.object({
  id: z.coerce.number(),
});

// OpenAPI Routes
const listStaffRoute = createGetRoute({
  path: '/api/healthcare/staff',
  summary: 'List all healthcare staff',
  responseSchema: StaffListResponseSchema,
  tags: ['Staff'],
});

const updateStaffRoute = createPutRoute({
  path: '/api/healthcare/staff/{id}',
  summary: 'Update staff member role or facility',
  requestSchema: UpdateStaffRequestSchema,
  responseSchema: StaffResponseSchema,
  params: StaffIdParam,
  tags: ['Staff'],
});

const deleteStaffRoute = createDeleteRoute({
  path: '/api/healthcare/staff/{id}',
  summary: 'Remove staff member access',
  params: StaffIdParam,
  tags: ['Staff'],
});

export const StaffSchemas = {
  StaffSchema,
  UpdateStaffRequestSchema,
  StaffListResponseSchema,
  StaffResponseSchema,
  listStaffRoute,
  updateStaffRoute,
  deleteStaffRoute,
};
