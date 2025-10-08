import type {
  createTokenFcm,
  FcmResponse,
} from '@/modules/emergency/types/fcm.type';
import { handlePrismaError } from '@/errors';
import prisma from '@/config/client.ts';

const getAllFcmToken = async (): Promise<FcmResponse[]> => {
  try {
    return await prisma.fcm_token.findMany();
  } catch (error) {
    handlePrismaError(error);
  }
};

const createFcmToken = async (data: createTokenFcm): Promise<FcmResponse> => {
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
    return !existingToken;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getAllFcmToken, createFcmToken, checkFcmTokenExist };
