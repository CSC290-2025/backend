import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const questionsSchema = z.object({
  id: z.number(),
  question: z.string(),
  level: z.number().nullable(),
  created_at: z.date(),
  updated_at: z.date().optional(),
});

const questionId = z.object({
  id: z.number(),
});

const getQuestion = createGetRoute({
  path: '/question/{id}',
  summary: 'Get question',
  responseSchema: questionsSchema,
  params: questionId,
  tags: ['Know-AI', 'Question'],
});

export { questionsSchema, questionId, getQuestion };
