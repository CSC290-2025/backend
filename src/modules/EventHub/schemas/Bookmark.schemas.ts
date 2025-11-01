import { z, createRoute } from '@hono/zod-openapi';

export const EventBookmarkSchema = z
  .object({
    user_id: z.number().int(),
    event_id: z.number().int(),
    created_at: z.coerce.date(),
  })
  .openapi('EventBookmark');

export const CreateBookmarkSchema = z
  .object({
    event_id: z.number().int().positive(),
  })
  .openapi('CreateBookmark');

const EventIdParam = z
  .object({
    event_id: z.coerce.number().int().positive(),
  })
  .openapi('EventIdParam');

const Pagination = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .openapi('Pagination');

const ListBookmarksResponse = z.object({
  items: z.array(EventBookmarkSchema),
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
});

export const BookmarkSchemas = {
  listBookmarksRoute: createRoute({
    method: 'get',
    path: '/bookmarks',
    request: { query: Pagination },
    responses: {
      200: {
        description: "List current user's bookmarks",
        content: { 'application/json': { schema: ListBookmarksResponse } },
      },
    },
    tags: ['Bookmarks'],
  }),

  createBookmarkRoute: createRoute({
    method: 'post',
    path: '/bookmarks',
    request: {
      body: {
        content: { 'application/json': { schema: CreateBookmarkSchema } },
      },
    },
    responses: {
      201: {
        description: 'Created',
        content: {
          'application/json': {
            schema: z.object({ bookmark: EventBookmarkSchema }),
          },
        },
      },
    },
    tags: ['Bookmarks'],
  }),

  deleteBookmarkRoute: createRoute({
    method: 'delete',
    path: '/bookmarks/{event_id}',
    request: { params: EventIdParam },
    responses: {
      200: {
        description: 'Deleted',
        content: {
          'application/json': {
            schema: z.object({ success: z.literal(true) }),
          },
        },
      },
    },
    tags: ['Bookmarks'],
  }),

  checkBookmarkStatusRoute: createRoute({
    method: 'get',
    path: '/bookmarks/status/{event_id}',
    request: { params: EventIdParam },
    responses: {
      200: {
        description: 'Check if user bookmarked event',
        content: {
          'application/json': { schema: z.object({ bookmarked: z.boolean() }) },
        },
      },
    },
    tags: ['Bookmarks'],
  }),
};
