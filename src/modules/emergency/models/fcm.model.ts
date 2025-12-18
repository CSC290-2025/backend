import type {
  CreateTokenFcm,
  TokenFcmResponse,
} from '@/modules/emergency/types/token.type';
import { handlePrismaError } from '@/errors';
import prisma from '@/config/client.ts';

const getAllFcmToken = async (): Promise<TokenFcmResponse[]> => {
  try {
    return await prisma.fcm_token.findMany({});
  } catch (error) {
    handlePrismaError(error);
  }
};

const createFcmToken = async (
  data: CreateTokenFcm
): Promise<TokenFcmResponse> => {
  try {
    return prisma.fcm_token.create({
      data,
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const checkFcmTokenExist = async (token: string): Promise<boolean> => {
  try {
    const existingToken = await prisma.fcm_token.findFirst({
      where: { tokens: token },
      select: { id: true },
    });

    return !!existingToken;
  } catch (error) {
    handlePrismaError(error);
  }
};

const getFcmTokenByUserId = async (
  userId: number
): Promise<TokenFcmResponse | null> => {
  try {
    return await prisma.fcm_token.findFirst({
      where: { user_id: userId },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  getAllFcmToken,
  createFcmToken,
  checkFcmTokenExist,
  getFcmTokenByUserId,
};
