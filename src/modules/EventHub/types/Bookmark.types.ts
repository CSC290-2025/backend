import type { z } from 'zod';
import type { BookmarkSchemas } from '../schemas';

type Bookmark = z.infer<typeof BookmarkSchemas.EventBookmarkSchema>;
type CreateBookmarkInput = z.infer<typeof BookmarkSchemas.CreateBookmarkSchema>;
type BookmarkedUser = z.infer<typeof BookmarkSchemas.BookmarkedUserSchema>;

export type { Bookmark, CreateBookmarkInput, BookmarkedUser };
