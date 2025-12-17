import prisma from '@/config/client';
import { NotFoundError, handlePrismaError } from '@/errors';
import type { Bookmark, CreateBookmarkInput, BookmarkedUser } from '../types';

const listByUser = async (userId: number, page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.event_bookmarks.findMany({
        where: { user_id: userId },
        take: limit,
        skip,
        orderBy: { created_at: 'desc' },
      }),
      prisma.event_bookmarks.count({
        where: { user_id: userId },
      }),
    ]);

    return { items, total };
  } catch (err) {
    handlePrismaError(err);
  }
};

const findByUserAndEvent = async (userId: number, eventId: number) => {
  try {
    return await prisma.event_bookmarks.findUnique({
      where: {
        user_id_event_id: { user_id: userId, event_id: eventId },
      },
    });
  } catch (err) {
    handlePrismaError(err);
    return null;
  }
};
const create = async (userId: number, data: { event_id: number }) => {
  try {
    return await prisma.event_bookmarks.create({
      data: {
        user_id: userId,
        event_id: data.event_id,
      },
    });
  } catch (err) {
    handlePrismaError(err);
    throw err;
  }
};

const remove = async (userId: number, eventId: number) => {
  try {
    const x = await prisma.event_bookmarks.deleteMany({
      where: {
        user_id: userId,
        event_id: eventId,
      },
    });

    if (x.count === 0) throw new NotFoundError('Bookmark not found');
    return true;
  } catch (err) {
    handlePrismaError(err);
    throw err;
  }
};
const listUsersByEvent = async (
  eventId: number
): Promise<{ id: number }[] | undefined> => {
  try {
    const bookmarks = await prisma.event_bookmarks.findMany({
      where: { event_id: eventId },
      select: {
        user_id: true,
      },
    });

    return bookmarks.map((bookmark) => ({
      id: bookmark.user_id,
    }));
  } catch (err) {
    handlePrismaError(err);
  }
};
export const BookmarkModel = {
  listByUser,
  findByUserAndEvent,
  create,
  remove,
  listUsersByEvent,
};
