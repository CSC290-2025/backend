import type * as z from 'zod';
import type { QuestionSchema } from '@/modules/Know_AI/schemas';

type question = z.infer<typeof QuestionSchema.questionsSchema>;
type questionId = z.infer<typeof QuestionSchema.questionId>;

export type { question, questionId };
