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

const createUserExercise = async (data: {
  user_id: number;
  question_id: number;
  user_answer: string;
  is_correct: boolean;
}): Promise<exercise> => {
  try {
    const newExercise = await prisma.user_exercises.create({
      data: {
        user_id: data.user_id,
        question_id: data.question_id,
        user_answer: data.user_answer,
        is_correct: data.is_correct,
        created_at: new Date(),
      },
    });
    return newExercise;
  } catch (error) {
    handlePrismaError(error);
  }
};

// const getUserExercisesByLevel = async (userId: number, level: number) => {
//   try {
//     const exercises = await prisma.user_exercises.findMany({
//       where: {
//         user_id: userId,
//         questions: {
//           level: level,
//         },
//       },
//       include: {
//         questions: true,
//       },
//       orderBy: {
//         created_at: 'asc',
//       },
//     });
//     return exercises;
//   } catch (error) {
//     handlePrismaError(error);
//     return [];
//   }
// };

// const getUserExercisesByLevel = async (
//   userId: number,
//   level: number
// ): Promise<any[]> => {
//   try {
//     const exercises = await prisma.$queryRaw<any[]>`
//       SELECT DISTINCT ON (question_id)
//         userExercise.*
//       FROM user_exercises userExercise
//       INNER JOIN questions q ON userExercise.question_id = q.id
//       WHERE userExercise.user_id = ${userId}
//         AND q.level = ${level}
//       ORDER BY userExercise.question_id, userExercise.created_at DESC
//     `;
//     return exercises;
//   } catch (error) {
//     handlePrismaError(error);
//     return [];
//   }
// };

const getUserExercisesByLevel = async (
  userId: number,
  level: number
): Promise<any[]> => {
  try {
    const exercises = await prisma.user_exercises.findMany({
      where: {
        user_id: userId,
        questions: {
          level: level,
        },
      },
      include: {
        questions: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const latestMap = exercises.reduce((map, exercise: any) => {
      if (!map.has(exercise.question_id)) {
        map.set(exercise.question_id, exercise);
      }
      return map;
    }, new Map<number, any>());

    return Array.from(latestMap.values());
  } catch (error) {
    handlePrismaError(error);
  }
};

const countCorrectAnswersByLevel = async (
  userId: number,
  level: number
): Promise<number> => {
  try {
    const count = await prisma.user_exercises.count({
      where: {
        user_id: userId,
        is_correct: true,
        questions: {
          level: level,
        },
      },
    });
    return count;
  } catch (error) {
    handlePrismaError(error);
    return 0;
  }
};

export {
  getExercise,
  createUserExercise,
  getUserExercisesByLevel,
  countCorrectAnswersByLevel,
};
