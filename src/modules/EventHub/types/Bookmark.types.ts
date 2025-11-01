import type { z } from 'zod';
import type { BookmarkSchema, BookmarkListItemSchema } from '../schemas';

type Bookmark = z.infer<typeof BookmarkSchema>;
type BookmarkListItem = z.infer<typeof BookmarkListItemSchema>;

export type { Bookmark, BookmarkListItem };
