import type { fcmToken } from '@/types/fcm.type';
import { handlePrismaError } from '@/errors';
import prisma from '@/config/client';

const getAllFcmToken = async (): Promise<fcmToken[]> => {
  try {
    return await prisma.fcmToken.findMany();
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getAllFcmToken };
