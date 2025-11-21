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

const completeLevelBody = z.object({
  user_id: z.coerce.number(),
});

const completeLevelParams = z.object({
  level: z.coerce.number(),
});

//just response to frontend
const completeLevelResponse = z.object({
  passed: z.boolean(),
  score_percentage: z.number(),
  correct_answers: z.number(),
  total_questions: z.number(),
  current_level: z.number(),
  new_level: z.number(),
  leveled_up: z.boolean(),
});

const getUserLevel = createGetRoute({
  path: '/level/{user_id}',
  summary: 'Get level',
  responseSchema: levelSchema,
  params: levelParam,
  tags: ['Know-AI', 'Level'],
});

const completeLevel = createPostRoute({
  path: '/level/{level}/complete',
  summary: 'Complete a level and check for level up',
  params: completeLevelParams,
  requestSchema: completeLevelBody,
  responseSchema: completeLevelResponse,
  tags: ['Know-AI', 'Level'],
});

export {
  levelSchema,
  levelParam,
  getUserLevel,
  completeLevel,
  completeLevelBody,
  completeLevelParams,
  completeLevelResponse,
};
