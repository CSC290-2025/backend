import type { Context } from 'hono';
import { successResponse } from '@/utils/response';
import * as BookmarkService from '../services/Bookmark.services';

const listBookmarks = async (c: Context) => {
  const page = Number(c.req.query('page') || '1');
  const limit = Number(c.req.query('limit') || '10');

  const user = c.get('user') as { id: number };
  const userId = user.id;

  const result = await BookmarkService.listBookmarks(userId, page, limit);
  return successResponse(c, result);
};

const createBookmark = async (c: Context) => {
  const user = c.get('user') as { id: number };
  const userId = user.id;

  const body = await c.req.json();
  const eventId = Number(body.event_id);

  const bookmark = await BookmarkService.createBookmark(userId, {
    event_id: eventId,
  });

  return successResponse(c, bookmark, 201, 'Event bookmarked successfully');
};

const deleteBookmark = async (c: Context) => {
  const user = c.get('user') as { id: number };
  const userId = user.id;

  const eventId = Number(c.req.param('event_id'));

  await BookmarkService.deleteBookmark(userId, eventId);
  return successResponse(c, { success: true });
};

const checkBookmarkStatus = async (c: Context) => {
  const user = c.get('user') as { id: number };
  const userId = user.id;

  const eventId = Number(c.req.param('event_id'));

  const bookmarked = await BookmarkService.checkBookmarkStatus(userId, eventId);
  return successResponse(c, { bookmarked });
};

export { listBookmarks, createBookmark, deleteBookmark, checkBookmarkStatus };
