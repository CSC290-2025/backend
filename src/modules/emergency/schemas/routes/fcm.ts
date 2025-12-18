import { createPostRoute } from '@/utils/openapi-helpers.ts';
import { FcmSchemas } from '@/modules/emergency/schemas';

const createFcmRoute = createPostRoute({
  path: 'emergency/fcm/all',
  summary: 'Create new fcm',
  requestSchema: FcmSchemas.CreateNotificationSchema,
  responseSchema: FcmSchemas.FcmBatchResponseSchema,
  tags: ['Report'],
});

const sendNotificationToToken = createPostRoute({
  path: 'emergency/fcm/token',
  summary: 'Send notification specific by token',
  requestSchema: FcmSchemas.CreateNotificationByTokenSchema,
  responseSchema: FcmSchemas.SendFcmResponseSchema,
  tags: ['Report'],
});

export { createFcmRoute, sendNotificationToToken };
