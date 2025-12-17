import * as z from 'zod';

const CreateTokenFcmSchema = z.object({
  tokens: z.string(),
  user_id: z.number().optional(),
});

const TokenFcmResponseSchema = z.object({
  id: z.number().int(),
  user_id: z.number().nullable(),
  tokens: z.string(),
  created_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date().nullable(),
});

export { CreateTokenFcmSchema, TokenFcmResponseSchema };
