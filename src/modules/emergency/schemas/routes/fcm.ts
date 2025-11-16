import { createPostRoute } from '@/utils/openapi-helpers.ts';
import { FcmSchemas } from '@/modules/emergency/schemas';

const createFcmRoute = createPostRoute({
  path: '/fcm',
  summary: 'Create new fcm',
  requestSchema: FcmSchemas.CreateTokenFcmSchema,
  responseSchema: FcmSchemas.FcmResponseSchema,
  tags: ['fcm'],
});

export { createFcmRoute };
