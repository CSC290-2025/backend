import type * as z from 'zod';
import type { LevelSchema } from '@/modules/Know_AI/schemas';

type level = z.infer<typeof LevelSchema.levelSchema>;
type levelId = z.infer<typeof LevelSchema.levelParam>;

export type { level, levelId };
