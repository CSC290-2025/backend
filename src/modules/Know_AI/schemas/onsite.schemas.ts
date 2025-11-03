import { z } from 'zod';

import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const onsiteSchema = z.object({
  id: z.number().int(),
  course_id: z.number().int().nullable(),
  address_id: z.number().int().nullable(),
  duration_hours: z.number().nullable(),
  event_at: z.coerce.date(),
  registration_deadline: z.coerce.date(),
  total_seats: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const createOnsiteSchema = z.object({
  course_id: z.number().int().nullable(),
  address_id: z.number().int().nullable(),
  duration_hours: z.number().positive().nullable().optional(),
  event_at: z.coerce.date(),
  registration_deadline: z.coerce.date(),
  total_seats: z.number().int().min(1).default(1),
});

const onsiteIdParam = z.object({
  id: z.number().int(),
});

const getAllOnsite = createGetRoute({
  path: '/onsite',
  summary: 'Get all onsites',
  responseSchema: z.array(onsiteSchema),
  tags: ['Know-AI', 'Onsite'],
});

const getOnsite = createGetRoute({
  path: '/onsite/{id}',
  summary: 'Get onsite',
  responseSchema: onsiteSchema,
  params: onsiteIdParam,
  tags: ['Know-AI', 'Onsite'],
});

const createOnsiteRoute = createPostRoute({
  path: '/onsite',
  summary: 'Create onsite',
  requestSchema: createOnsiteSchema,
  responseSchema: onsiteSchema,
  tags: ['Know-AI', 'Onsite'],
});

const deleteOnsiteRoute = createDeleteRoute({
  path: '/onsite/{id}',
  summary: 'Delete onsite',
  params: onsiteIdParam,
  tags: ['Know-AI', 'Onsite'],
});

export const onsiteSchemas = {
  onsiteSchema,
  createOnsiteSchema,
  onsiteIdParam,
  getAllOnsite,
  getOnsite,
  createOnsiteRoute,
  deleteOnsiteRoute,
};
