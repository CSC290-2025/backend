import { BookmarkModel } from '../models';
import { NotFoundError, ConflictError } from '@/errors';
import type { CreateBookmarkInput } from '../types';

const listBookmarks = async (userId: number, page: number, limit: number) => {
  return await BookmarkModel.listByUser(userId, page, limit);
};

const createBookmark = async (userId: number, data: CreateBookmarkInput) => {
  const exists = await BookmarkModel.findByUserAndEvent(userId, data.event_id);
  if (exists) throw new ConflictError('Event already bookmarked');
  return await BookmarkModel.create(userId, data);
};

const deleteBookmark = async (userId: number, eventId: number) => {
  const exists = await BookmarkModel.findByUserAndEvent(userId, eventId);
  if (!exists) throw new NotFoundError('Bookmark not found');
  return await BookmarkModel.remove(userId, eventId);
};

const checkBookmarkStatus = async (userId: number, eventId: number) => {
  const exists = await BookmarkModel.findByUserAndEvent(userId, eventId);
  return Boolean(exists);
};

const getBookmarkedUsers = async (eventId: number) => {
  const users = await BookmarkModel.listUsersByEvent(eventId);
  return users || [];
};

export {
  listBookmarks,
  createBookmark,
  deleteBookmark,
  checkBookmarkStatus,
  getBookmarkedUsers,
};
