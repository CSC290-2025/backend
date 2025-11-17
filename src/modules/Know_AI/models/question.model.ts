import prisma from '@/config/client.ts';
import { handlePrismaError } from '@/errors';
import type { question, questionId } from '@/modules/Know_AI/types';

const getQuestion = async (id: number): Promise<question> => {
  try {
    console.log(id);
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
    console.log(error);
    handlePrismaError(error);
  }
};

const getQuestionsByLevel = async (level: number) => {
  try {
    const questions = await prisma.questions.findMany({
      where: {
        level,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
    return questions;
  } catch (error) {
    handlePrismaError(error);
  }
};

const countQuestionsByLevel = async (level: number): Promise<number> => {
  try {
    const count = await prisma.questions.count({
      where: {
        level,
      },
    });
    return count;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getQuestion, getQuestionsByLevel, countQuestionsByLevel };
