import type { Context } from 'hono';
import { BookmarkService } from '../services/';

const listBookmarks = async (c: Context) => {
  const userId = Number(c.get('userId'));
  const page = Number(c.req.query('page')) || 1;
  const limit = Number(c.req.query('limit')) || 10;
  const data = await BookmarkService.listBookmarks(userId, page, limit);
  return c.json({ ...data, page, limit }, 200);
};

const createBookmark = async (c: Context) => {
  const userId = Number(c.get('userId'));
  const body = await c.req.json();
  const bookmark = await BookmarkService.createBookmark(userId, body);
  return c.json({ bookmark }, 201);
};

const deleteBookmark = async (c: Context) => {
  const userId = Number(c.get('userId'));
  const event_id = c.req.param('event_id');
  await BookmarkService.deleteBookmark(userId, Number(event_id));
  return c.json({ success: true as const }, 200);
};

const checkBookmarkStatus = async (c: Context) => {
  const userId = Number(c.get('userId'));
  const event_id = c.req.param('event_id');
  const bookmarked = await BookmarkService.checkBookmarkStatus(
    userId,
    Number(event_id)
  );
  return c.json({ bookmarked }, 200);
};

export { listBookmarks, createBookmark, deleteBookmark, checkBookmarkStatus };
