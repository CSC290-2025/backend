import type { Context } from 'hono';
import { ExerciseService } from '@/modules/Know_AI/services';
import { successResponse } from '@/utils/response.ts';

const getExercise = async (c: Context) => {
  const exerciseId = Number(c.req.param('id'));
  const exercise = await ExerciseService.getExercise(exerciseId);
  return successResponse(c, { exercise });
};

const submitAnswer = async (c: Context) => {
  const questionId = Number(c.req.param('question_id'));
  const body = await c.req.json();
  const { user_id, user_answer } = body;
  const result = await ExerciseService.submitAnswer(
    user_id,
    questionId,
    user_answer
  );
  return successResponse(c, result);
};

const getProgress = async (c: Context) => {
  const level = Number(c.req.param('level'));
  const userId = Number(c.req.query('user_id'));
  const progress = await ExerciseService.getExerciseProgress(userId, level);
  return successResponse(c, progress);
};

export { getExercise, submitAnswer, getProgress };
