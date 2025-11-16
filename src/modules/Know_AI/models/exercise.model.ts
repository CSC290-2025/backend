import prisma from '@/config/client.ts';
import { handlePrismaError } from '@/errors';
import type { exercise, exerciseId } from '@/modules/Know_AI/types';

const getExercise = async (id: number): Promise<exercise> => {
  try {
    const exercise = await prisma.user_exercises.findUnique({
      where: {
        id,
      },
    });

    if (!exercise) {
      throw new Error(`exercise with id ${id} not found`);
    }

    return exercise;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getExercise };
