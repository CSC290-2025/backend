import { createPostRoute } from '@/utils/openapi-helpers';
import { z } from 'zod';

const MetroCardSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  balance: z.number().default(0),
  card_number: z.string(),
  status: z.enum(['active', 'suspended']),
  created_at: z.date(),
  updated_at: z.date(),
});

const CreateMetroCardSchema = z.object({
  user_id: z.number(),
});

// OpenAPI route
const createMetroCardRoute = createPostRoute({
  path: '/metroCards',
  summary: 'Create new metro card',
  requestSchema: CreateMetroCardSchema,
  responseSchema: MetroCardSchema,
  tags: ['MetroCards'],
});

export const MetroCardSchemas = {
  MetroCardSchema,
  CreateMetroCardSchema,
  createMetroCardRoute,
};
