import type { fcmToken } from '@/modules/emergency/types/fcm.type.ts';
import { handlePrismaError } from '@/errors';
import prisma from '@/config/client.ts';

const getAllFcmToken = async (): Promise<fcmToken[]> => {
  try {
    return await prisma.fcmToken.findMany();
  } catch (error) {
    handlePrismaError(error);
  }
};

export { getAllFcmToken };
