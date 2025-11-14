import type { Bookmark, CreateBookmarkInput } from '../types';

const listByUser = async (
  userId: number,
  page: number,
  limit: number
): Promise<{ items: Bookmark[]; total: number }> => {
  return { items: [], total: 0 };
};

const findByUserAndEvent = async (
  userId: number,
  eventId: number
): Promise<Bookmark | null> => {
  return null;
};

const create = async (
  userId: number,
  data: CreateBookmarkInput
): Promise<Bookmark> => {
  const now = new Date();
  const bookmark: Bookmark = {
    user_id: userId,
    event_id: data.event_id,
    created_at: now,
  };
  return bookmark;
};

const remove = async (userId: number, eventId: number): Promise<boolean> => {
  return true;
};

export { listByUser, findByUserAndEvent, create, remove };
