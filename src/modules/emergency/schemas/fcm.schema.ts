import * as z from 'zod';

const SendFcmResponseSchema = z.object({
  message_id: z.string(),
});

const FcmBatchResponseSchema = z.object({
  successCount: z.number(),
  failureCount: z.number(),
  responses: z.array(
    z.object({
      success: z.boolean(),
      messageId: z.string().optional(),
      error: z
        .object({
          message: z.string(),
        })
        .optional(),
    })
  ),
});

const CreateNotificationByTokenSchema = z.object({
  token: z.string(),
  notification: z.object({
    title: z.string(),
    body: z.string(),
  }),
});

const CreateNotificationSchema = CreateNotificationByTokenSchema.omit({
  token: true,
});

export {
  CreateNotificationSchema,
  SendFcmResponseSchema,
  FcmBatchResponseSchema,
  CreateNotificationByTokenSchema,
};
