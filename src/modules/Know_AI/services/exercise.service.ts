import { ExerciseModel } from '@/modules/Know_AI/models';
import type { exercise, exerciseId } from '@/modules/Know_AI/types';

const getExercise = async (id: number): Promise<exercise> => {
  return await ExerciseModel.getExercise(id);
};

export { getExercise };
