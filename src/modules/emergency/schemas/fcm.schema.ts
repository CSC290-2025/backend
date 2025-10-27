import * as z from 'zod';

const FcmResponseSchema = z.object({
  id: z.number(),
  user_id: z.number().int().nullable(),
  tokens: z.string().nullable(),
  created_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date().nullable(),
});

const CreateTokenFcmSchema = z.object({
  tokens: z.string(),
  user_id: z.number().optional(),
});

const NotificationSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export { FcmResponseSchema, CreateTokenFcmSchema, NotificationSchema };
