import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import * as BookmarkService from '../services/Bookmark.services';

export const listBookmarks = async (c: Context) => {
  const page = Number(c.req.query('page') || 1);
  const limit = Number(c.req.query('limit') || 10);

  const user = c.get('user') as { id: number };
  const userId = user.id;

  const result = await BookmarkService.listBookmarks(userId, page, limit);

  return successResponse(c, result);
};

export const createBookmark = async (c: Context) => {
  const body = await c.req.json();
  const eventId = Number(body.event_id);

  if (!Number.isInteger(eventId)) {
    throw new Error('Invalid event_id');
  }
};
export const deleteBookmark = async (c: Context) => {
  const user = c.get('user') as { id: number };
  const userId = user.id;

  const eventId = Number(c.req.param('event_id'));

  await BookmarkService.deleteBookmark(userId, eventId);

  return successResponse(c, { success: true }, 200, 'Bookmark removed');
};

export const checkBookmarkStatus = async (c: Context) => {
  const user = c.get('user') as { id: number };
  const userId = user.id;

  const eventId = Number(c.req.param('event_id'));

  const bookmarked = await BookmarkService.checkBookmarkStatus(userId, eventId);

  return successResponse(c, { bookmarked });
};
export const getBookmarkedUsers = async (c: Context) => {
  const eventId = Number(c.req.param('event_id'));

  if (Number.isNaN(eventId)) {
    throw new Error('Invalid event ID');
  }

  const users = await BookmarkService.getBookmarkedUsers(eventId);

  return successResponse(c, { data: users });
};
