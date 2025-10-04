import * as z from 'zod';

const fcmSchema = z.object({
  id: z.number(),
  userId: z.number(),
  fcmTokens: z.string(),
  createdAt: z.coerce.date(),
  updateAt: z.coerce.date(),
});
export { fcmSchema };
