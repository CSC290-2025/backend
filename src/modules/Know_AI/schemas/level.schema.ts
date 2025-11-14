import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const levelSchema = z.object({
  user_id: z.coerce.number(),
  current_level: z.coerce.number(),
});

const levelParam = z.object({
  user_id: z.coerce.number(),
});

const getUserLevel = createGetRoute({
  path: '/level/{user_id}',
  summary: 'Get level',
  responseSchema: levelSchema,
  params: levelParam,
  tags: ['Know-AI', 'Level'],
});

export { levelSchema, levelParam, getUserLevel };
