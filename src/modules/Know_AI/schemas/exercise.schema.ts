import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const exerciseSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  question_id: z.number().nullable(),
  user_answer: z.string().nullable(),
  is_correct: z.boolean().nullable(),
  created_at: z.date(),
});

const exerciseId = z.object({
  id: z.number(),
});

const getExercise = createGetRoute({
  path: '/exercise/{id}',
  summary: 'Get exercise',
  responseSchema: exerciseSchema,
  params: exerciseId,
  tags: ['Know-AI', 'Exercise'],
});

export { exerciseSchema, exerciseId, getExercise };
