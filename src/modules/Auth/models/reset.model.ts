import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import { hash } from 'bcryptjs';

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

const changeUserPassword = async (userId: number, newPassword: string) => {
  try {
    return await prisma.users.update({
      where: { id: userId },
      data: { password_hash: newPassword },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  revokeAllUserTokens,
  revokeResetToken,
  findResetToken,
  saveResetToken,
  changeUserPassword,
};
