import { successResponse } from '@/utils/response';
import { BookmarkService } from '../services';
import type { Context } from 'hono';

const listBookmarks = async (c: Context) => {
  const page = Number(c.req.query('page') || '1');
  const limit = Number(c.req.query('limit') || '10');
  const userId = c.get('userId');

  const result = await BookmarkService.listUserBookmarks(userId, page, limit);
  return successResponse(c, result);
};

const createBookmark = async (c: Context) => {
  const eventId = Number(c.req.param('id'));
  const userId = c.get('userId');
  const bookmark = await BookmarkService.bookmarkEvent(userId, eventId);
  return successResponse(c, bookmark, 201, 'Event bookmarked successfully');
};

const deleteBookmark = async (c: Context) => {
  const eventId = Number(c.req.param('id'));
  const userId = c.get('userId'); // From auth middleware

  await BookmarkService.removeBookmark(userId, eventId);
  return successResponse(c, null, 200, 'Bookmark removed successfully');
};

const checkBookmarkStatus = async (c: Context) => {
  const eventId = Number(c.req.param('id'));
  const userId = c.get('userId');

  const status = await BookmarkService.checkBookmarkStatus(userId, eventId);
  return successResponse(c, status);
};

export { listBookmarks, createBookmark, deleteBookmark, checkBookmarkStatus };
