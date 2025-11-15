import prisma from '../../../config/client';
import { handlePrismaError } from '../../../errors';

export const join = async (eventId: number, userId: number) => {
  try {
    return await prisma.volunteer_event_participation.create({
      data: {
        volunteer_event_id: eventId,
        user_id: userId,
        // created_at will default to now()
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};
