import prisma from '@/config/client.ts';
import { handlePrismaError } from '@/errors';
import type { question, questionId } from '@/modules/Know_AI/types';

const getQuestion = async (id: number): Promise<question> => {
  try {
    const question = await prisma.questions.findUnique({
      where: {
        id,
      },
    });

    if (!question) {
      throw new Error(`Question with id ${id} not found`);
    }

    return question;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getQuestion };
