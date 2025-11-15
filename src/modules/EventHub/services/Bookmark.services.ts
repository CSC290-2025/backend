import { BookmarkModel } from '../models';
import { NotFoundError, ConflictError } from '@/errors';
import type { CreateBookmarkInput } from '../types';

const listBookmarks = async (userId: number, page: number, limit: number) => {
  return await BookmarkModel.listByUser(userId, page, limit);
};

const createBookmark = async (userId: number, data: CreateBookmarkInput) => {
  const existing = await BookmarkModel.findByUserAndEvent(
    userId,
    data.event_id
  );
  if (existing) throw new ConflictError('Event already bookmarked');
  return await BookmarkModel.create(userId, data);
};

const deleteBookmark = async (userId: number, eventId: number) => {
  const existing = await BookmarkModel.findByUserAndEvent(userId, eventId);
  if (!existing) throw new NotFoundError('Bookmark not found');
  return await BookmarkModel.remove(userId, eventId);
};

const checkBookmarkStatus = async (userId: number, eventId: number) => {
  const existing = await BookmarkModel.findByUserAndEvent(userId, eventId);
  return Boolean(existing);
};

export { listBookmarks, createBookmark, deleteBookmark, checkBookmarkStatus };
