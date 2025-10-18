import { z } from 'zod';
import { createPostRoute } from '@/utils/openapi-helpers';

export const ReportCreateBody = z.object({
  type: z.union([z.number().int().positive(), z.string().min(1)]),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  location: z.object({
    latitude: z.number().gte(-90).lte(90),
    longitude: z.number().gte(-180).lte(180),
  }),
  ambulance: z.boolean().default(false),
});

export const ReportCreateResponse = z.object({
  id: z.number().int(),
  user_id: z.number().int().nullable(),
  image_url: z.string().nullable(),
  description: z.string().nullable(),
  ambulance_service: z.boolean().nullable(),
  report_category_id: z.number().int().nullable(),
  status: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const createEmergencyReportRoute = createPostRoute({
  path: '/emergency/reports',
  summary: 'Create emergency report',
  requestSchema: ReportCreateBody,
  responseSchema: ReportCreateResponse,
  tags: ['Emergency'],
});
