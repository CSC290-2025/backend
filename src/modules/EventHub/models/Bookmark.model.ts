import prisma from '@/config/client';
import { handlePrismaError, NotFoundError } from '@/errors';
import type { Bookmark, CreateBookmarkInput } from '../types';

const listByUser = async (
  userId: number,
  page: number,
  limit: number
): Promise<{ items: Bookmark[]; total: number }> => {
  try {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.event_bookmarks.findMany({
        where: { user_id: userId },
        take: limit,
        skip,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.event_bookmarks.count({
        where: { user_id: userId },
      }),
    ]);

    return { items, total };
  } catch (error) {
    console.error('Error in listByUser:', error);
    handlePrismaError(error);
  }
};

const findByUserAndEvent = async (
  userId: number,
  eventId: number
): Promise<Bookmark | null> => {
  try {
    return await prisma.event_bookmarks.findUnique({
      where: {
        user_id_event_id: {
          user_id: userId,
          event_id: eventId,
        },
      },
    });
  } catch (error) {
    console.error('Error in findByUserAndEvent:', error);
    handlePrismaError(error);
    return null;
  }
};

const create = async (
  userId: number,
  data: CreateBookmarkInput
): Promise<Bookmark> => {
  try {
    return await prisma.event_bookmarks.create({
      data: {
        user_id: userId,
        event_id: data.event_id,
      },
    });
  } catch (error) {
    console.error('Error in create:', error);
    handlePrismaError(error);
  }
};

const remove = async (userId: number, eventId: number): Promise<boolean> => {
  try {
    const deletedRecord = await prisma.event_bookmarks.deleteMany({
      where: {
        user_id: userId,
        event_id: eventId,
      },
    });

    if (deletedRecord.count === 0) {
      throw new NotFoundError('Bookmark not found');
    }

    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    console.error('Error in remove:', error);
    handlePrismaError(error);
  }
};

export { listByUser, findByUserAndEvent, create, remove };
