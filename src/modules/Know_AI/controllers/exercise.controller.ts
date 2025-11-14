import type { Context } from 'hono';
import { ExerciseService } from '@/modules/Know_AI/services';
import { successResponse } from '@/utils/response.ts';

const getExercise = async (c: Context) => {
  const exerciseId = Number(c.req.param('id'));
  const exercise = await ExerciseService.getExercise(exerciseId);
  return successResponse(c, { exercise });
};

export { getExercise };
