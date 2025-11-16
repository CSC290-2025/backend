import { createPostRoute } from '@/utils/openapi-helpers.ts';
import { TokenFcmSchemas } from '@/modules/emergency/schemas';

const createTokenFcmRoute = createPostRoute({
  path: '/tokens',
  summary: 'Create new token',
  requestSchema: TokenFcmSchemas.CreateTokenFcmSchema,
  responseSchema: TokenFcmSchemas.TokenFcmResponseSchema,
  tags: [`token`],
});

export { createTokenFcmRoute };
