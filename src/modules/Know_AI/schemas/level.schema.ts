import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const levelSchema = z.object({
  user_id: z.number(),
  current_level: z.number(),
});

const levelParam = z.object({
  user_id: z.number(),
});

const getUserLevel = createGetRoute({
  path: '/level/{id}',
  summary: 'Get level',
  responseSchema: levelSchema,
  params: levelParam,
  tags: ['Know-AI', 'Level'],
});

export { levelSchema, levelParam, getUserLevel };
