import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const BookmarkSchema = z.object({
  user_id: z.number(),
  event_id: z.number(),
  created_at: z.string().datetime(),
});

const BookmarkListItemSchema = z.object({
  event_id: z.number(),
  title: z.string(),
  description: z.string(),
  image_url: z.string().url().nullable(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  organization_id: z.number().nullable().optional(),
  bookmarked_at: z.string().datetime(),
});

const BookmarkQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default('10'),
});

const BookmarkEventIdParam = z.object({
  id: z.string().transform(Number).pipe(z.number().int()),
});

const listBookmarksRoute = createGetRoute({
  path: '/events/bookmarks',
  summary: "Get user's bookmarked events",
  responseSchema: z.object({
    bookmarks: z.array(BookmarkListItemSchema),
    pagination: z.object({
      current_page: z.number(),
      total_pages: z.number(),
      total_items: z.number(),
      items_per_page: z.number(),
    }),
  }),
  query: BookmarkQuerySchema,
  tags: ['Event Bookmarks'],
});

const createBookmarkRoute = createPostRoute({
  path: '/events/{id}/bookmark',
  summary: 'Bookmark an event',
  requestSchema: z.object({}),
  responseSchema: z.object({
    event_id: z.number(),
    bookmarked_at: z.string().datetime(),
  }),
  params: BookmarkEventIdParam,
  tags: ['Event Bookmarks'],
});

const deleteBookmarkRoute = createDeleteRoute({
  path: '/events/{id}/bookmark',
  summary: 'Remove bookmark',
  params: BookmarkEventIdParam,
  tags: ['Event Bookmarks'],
});

const checkBookmarkStatusRoute = createGetRoute({
  path: '/events/{id}/bookmark/status',
  summary: 'Check if event is bookmarked',
  responseSchema: z.object({
    event_id: z.number(),
    is_bookmarked: z.boolean(),
    bookmarked_at: z.string().datetime().nullable(),
  }),
  params: BookmarkEventIdParam,
  tags: ['Event Bookmarks'],
});

export {
  BookmarkSchema,
  BookmarkListItemSchema,
  BookmarkQuerySchema,
  BookmarkEventIdParam,
  listBookmarksRoute,
  createBookmarkRoute,
  deleteBookmarkRoute,
  checkBookmarkStatusRoute,
};
