import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { authMiddleware } from '@/middlewares';
import { EventSchemas } from './Event.schemas';
const EventBookmarkSchema = z.object({
  user_id: z.number().int(),
  event_id: z.number().int(),
  created_at: z.coerce.date(),
  event: EventSchemas.EventSchema.optional(),
});

const CreateBookmarkSchema = z.object({
  event_id: z.number().int().positive(),
});

const EventIdParam = z.object({
  event_id: z.coerce.number().int().positive(),
});

const Pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const ListBookmarksResponse = z.object({
  items: z.array(EventBookmarkSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

const listBookmarksRoute = createGetRoute({
  path: '/bookmarks',
  summary: 'List bookmarks',
  query: Pagination,
  responseSchema: ListBookmarksResponse,
  tags: ['Bookmarks'],
  middleware: [authMiddleware],
});

const createBookmarkRoute = createPostRoute({
  path: '/bookmarks',
  summary: 'Create bookmark',
  requestSchema: CreateBookmarkSchema,
  responseSchema: z.object({
    bookmark: EventBookmarkSchema,
  }),
  tags: ['Bookmarks'],
  middleware: [authMiddleware],
});

const deleteBookmarkRoute = createDeleteRoute({
  path: '/bookmarks/{eve    nt_id}',
  summary: 'Delete bookmark',
  params: EventIdParam,
  tags: ['Bookmarks'],
  middleware: [authMiddleware],
});

const checkBookmarkStatusRoute = createGetRoute({
  path: '/bookmarks/status/{event_id}',
  summary: 'Check bookmark status',
  params: EventIdParam,
  responseSchema: z.object({
    bookmarked: z.boolean(),
  }),
  tags: ['Bookmarks'],
  middleware: [authMiddleware],
});
const BookmarkedUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  full_name: z.string(),
});

const GetBookmarkedUsersResponse = z.object({
  data: z.array(BookmarkedUserSchema),
});

const getBookmarkedUsersRoute = createGetRoute({
  path: '/bookmarks/events/{event_id}/users', // New, clear endpoint
  summary: 'Get all users who bookmarked a specific event',
  params: EventIdParam,
  responseSchema: GetBookmarkedUsersResponse,
  tags: ['Bookmarks'],
});
export const BookmarkSchemas = {
  EventBookmarkSchema,
  CreateBookmarkSchema,
  EventIdParam,
  Pagination,
  ListBookmarksResponse,

  listBookmarksRoute,
  createBookmarkRoute,
  deleteBookmarkRoute,
  checkBookmarkStatusRoute,
  BookmarkedUserSchema,
  getBookmarkedUsersRoute,
};
