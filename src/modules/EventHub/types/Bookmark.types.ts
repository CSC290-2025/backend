import type { z } from 'zod';
import type { BookmarkSchemas } from '../schemas';

type Bookmark = z.infer<typeof BookmarkSchemas.EventBookmarkSchema>;
type CreateBookmarkInput = z.infer<typeof BookmarkSchemas.CreateBookmarkSchema>;

export type { Bookmark, CreateBookmarkInput };
