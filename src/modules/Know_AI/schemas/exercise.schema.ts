import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const exerciseSchema = z.object({
  id: z.coerce.number(),
  user_id: z.number().nullable(),
  question_id: z.number().nullable(),
  user_answer: z.string().nullable(),
  is_correct: z.boolean().nullable(),
  created_at: z.date(),
});

const exerciseId = z.object({
  id: z.coerce.number(),
});

const submitAnswer = z.object({
  user_id: z.coerce.number(),
  user_answer: z.string().min(1, 'Answer cannot be empty'),
});

const submitAnswerId = z.object({
  question_id: z.coerce.number(),
});

//only for response back to frontend not saved at datbase
const submitAnswerResponse = z.object({
  id: z.coerce.number(),
  is_correct: z.boolean(),
  feedback: z.string(),
  confidence: z.number(),
  suggestions: z.string(),
});

const progressParams = z.object({
  level: z.coerce.number(),
});

const progressQuery = z.object({
  user_id: z.coerce.number(),
});

const progressResponse = z.object({
  level: z.number(),
  total_questions: z.number(),
  answered_questions: z.number(),
  correct_answers: z.number(),
  progress_percentage: z.number(),
  score_percentage: z.number(),
  questions: z.array(
    z.object({
      id: z.number(),
      question: z.string(),
      answered: z.boolean(),
      is_correct: z.boolean(),
    })
  ),
});

const getExercise = createGetRoute({
  path: '/exercise/{id}',
  summary: 'Get exercise',
  responseSchema: exerciseSchema,
  params: exerciseId,
  tags: ['Know-AI', 'Exercise'],
});

const createSubmitAnswer = createPostRoute({
  path: '/exercise/{question_id}/submit',
  summary: 'Submit answer for AI evaluation',
  params: submitAnswerId,
  requestSchema: submitAnswer,
  responseSchema: submitAnswerResponse,
  tags: ['Know-AI', 'Exercise'],
});

const getProgress = createGetRoute({
  path: '/exercise/{level}/progress',
  summary: 'Get exercise progress for a specific level',
  params: progressParams,
  query: progressQuery,
  responseSchema: progressResponse,
  tags: ['Know-AI', 'Exercise'],
});

export {
  exerciseSchema,
  exerciseId,
  getExercise,
  submitAnswer,
  submitAnswerId,
  submitAnswerResponse,
  createSubmitAnswer,
  progressParams,
  progressQuery,
  progressResponse,
  getProgress,
};
