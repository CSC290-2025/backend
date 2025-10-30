import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const enrollmentOnsite = z.object({
  id: z.number(),
  onsite_id: z.number().nullable(),
  user_id: z.number().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const enrollmentOnsiteId = z.object({
  id: z.number(),
});

const createEnrollmentOnsite = z.object({
  onsite_id: z.number().nullable(),
  user_id: z.number().nullable(),
});

const getEnrollment = createGetRoute({
  path: '/enrollment/{id}',
  summary: 'Get enrollment',
  responseSchema: enrollmentOnsite,
  params: enrollmentOnsiteId,
  tags: ['Know-AI'],
});

const createEnrollmentRoute = createPostRoute({
  path: '/createEnrollment',
  summary: 'Create enrollment',
  requestSchema: createEnrollmentOnsite,
  responseSchema: enrollmentOnsite,
  tags: ['Know-AI'],
});

export {
  enrollmentOnsite,
  enrollmentOnsiteId,
  createEnrollmentOnsite,
  getEnrollment,
  createEnrollmentRoute,
};
