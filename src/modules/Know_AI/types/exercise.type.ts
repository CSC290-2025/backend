import type * as z from 'zod';
import type { ExerciseSchema } from '@/modules/Know_AI/schemas';

type exercise = z.infer<typeof ExerciseSchema.exerciseSchema>;
type exerciseId = z.infer<typeof ExerciseSchema.exerciseId>;

export type { exercise, exerciseId };
