import * as z from 'zod';
import { createPostRoute } from '@/utils/openapi-helpers';

export const DistanceRequestSchema = z.object({
  origin: z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
  }),
  destination: z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
  }),
});

export const DistanceResponseSchema = z.object({
  distance: z.number(),
  unit: z.string().optional(),
});

export const calculateDistanceRoute = createPostRoute({
  path: '/api/distance',
  summary: 'Calculate distance',
  requestSchema: DistanceRequestSchema,
  responseSchema: DistanceResponseSchema,
  tags: ['SupportMap'],
});
