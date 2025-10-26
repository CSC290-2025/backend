import { z } from 'zod';
import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers';

export const LightRequestSchema = z.object({
  request_id: z.number(),
  traffic_light_id: z.number(),
  requested_by: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  reason: z.string(),
  emergency_id: z.number().optional(),
  status: z.string(),
  //requested_at: z.string().datetime(),
});

export const CreateLightRequestSchema = z.object({
  traffic_light_id: z.number(),
  requested_by: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  reason: z.string(),
});

export const LightRequestQuerySchema = z.object({
  traffic_light_id: z.coerce.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(50),
});

export const LightRequestSchemas = {
  LightRequestSchema,
  CreateLightRequestSchema,
  LightRequestQuerySchema,

  createRequestRoute: createPostRoute({
    path: '/api/light-requests',
    summary: 'Create a light request',
    requestSchema: CreateLightRequestSchema,
    responseSchema: LightRequestSchema,
    tags: ['Light Requests'],
  }),

  getRequestsRoute: createGetRoute({
    path: '/api/light-requests',
    summary: 'Get light request history with filters',
    responseSchema: z.object({
      data: z.array(LightRequestSchema),
      meta: z.object({
        total: z.number(),
        page: z.number(),
        per_page: z.number(),
        filters_applied: z.any(),
      }),
    }),
    query: LightRequestQuerySchema,
    tags: ['Light Requests'],
  }),
};
