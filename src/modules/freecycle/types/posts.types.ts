import type { z } from 'zod';
import type { FreecyclePostsSchemas } from '../schemas';

type FreecyclePost = z.infer<typeof FreecyclePostsSchemas.FreecyclePostsSchema>;
type CreateFreecyclePostData = z.infer<
  typeof FreecyclePostsSchemas.CreateFreecyclePostsSchema
>;
type UpdateFreecyclePostData = z.infer<
  typeof FreecyclePostsSchemas.UpdateFreecyclePostsSchema
>;

export type { FreecyclePost, CreateFreecyclePostData, UpdateFreecyclePostData };
