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

const findResetToken = async (token: string) => {
  try {
    return await prisma.verification_token.findFirst({
      where: {
        token: token,
        expires_at: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        user_id: true,
        expires_at: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const revokeResetToken = async (resetTokenId: number) => {
  try {
    return await prisma.verification_token.delete({
      where: { id: resetTokenId },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const revokeAllUserTokens = async (userId: number) => {
  try {
    return await prisma.verification_token.deleteMany({
      where: { user_id: userId },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};
