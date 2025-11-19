import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

const getUserinfoAndWallet = async (user_id: number) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        wallets: true,
      },
    });
    return user;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getUserinfoAndWallet };
