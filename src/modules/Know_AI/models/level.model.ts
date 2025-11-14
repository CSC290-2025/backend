import prisma from '@/config/client.ts';
import { handlePrismaError } from '@/errors';
import type { level, levelId } from '@/modules/Know_AI/types';

const getLevel = async (user_id: number): Promise<level> => {
  try {
    const level = await prisma.user_levels.findUnique({
      where: {
        user_id,
      },
    });

    if (!level) {
      throw new Error(`Level with id ${user_id} not found`);
    }

    return level;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getLevel };
