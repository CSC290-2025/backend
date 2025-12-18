import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';

export const EmergencyReportSchema = z.object({
  id: z.number(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  ambulance_service: z.boolean().nullable().optional(),
  report_category: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  created_at: z.string().or(z.date()),
  user_id: z.number().nullable().optional(),
  // We can add location later if needed, but for now let's keep it simple or just basic lat/long if available in addresses relation
});

export const EmergencyListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(EmergencyReportSchema),
  message: z.string().optional(),
});

export const getActiveEmergenciesRoute = createRoute({
  method: 'get',
  path: '/api/healthcare/emergencies',
  tags: ['Healthcare Emergency'],
  summary: 'Get all active emergencies (pending & verified)',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: EmergencyListResponseSchema,
        },
      },
      description: 'List of active emergencies',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});
