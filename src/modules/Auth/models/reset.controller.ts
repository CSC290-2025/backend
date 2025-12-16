import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@prisma/client/scripts/default-index';

const saveResetToken = async (
  userId: number,
  token: string,
  expiresAt: Date
) => {
  try {
    return await prisma.verification_token.create({
      data: {
        user_id: userId,
        token: token,
        expires_at: expiresAt,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};
