import type { z } from 'zod';
import type { EventBookmarkSchema, CreateBookmarkSchema } from '../schemas';

type Bookmark = z.infer<typeof EventBookmarkSchema>;
type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>;

export type { Bookmark, CreateBookmarkInput };
