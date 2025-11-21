import prisma from '@/config/client.ts';
import { handlePrismaError } from '@/errors';
import type { level, levelId } from '@/modules/Know_AI/types';

const getLevel = async (user_id: number): Promise<level> => {
  try {
    console.log(user_id);
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

const updateLevel = async (
  userId: number,
  newLevel: number
): Promise<level> => {
  try {
    const updated = await prisma.user_levels.update({
      where: {
        user_id: userId,
      },
      data: {
        current_level: newLevel,
      },
    });
    return updated;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getLevel, updateLevel };
