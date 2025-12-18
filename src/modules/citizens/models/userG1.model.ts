import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

const getUserAddress = async (user_id: number) => {
  try {
    const user = await prisma.user_profiles.findUnique({
      where: { user_id },
      select: {
        addresses: true,
      },
    });
    return user;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getUserAddress };
