import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

const findUserById = async (user_id: number) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
    });
    return user;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findUserById };
