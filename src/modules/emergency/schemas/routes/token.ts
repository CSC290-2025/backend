import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers.ts';
import { TokenFcmSchemas } from '@/modules/emergency/schemas';
import * as z from 'zod';

const createTokenFcmRoute = createPostRoute({
  path: '/emergency/tokens',
  summary: 'Create new token',
  requestSchema: TokenFcmSchemas.CreateTokenFcmSchema,
  responseSchema: TokenFcmSchemas.TokenFcmResponseSchema,
  tags: ['Report'],
});

const findTokenByUserIdRoute = createGetRoute({
  path: '/emergency/token/{user_id}',
  summary: 'Get token by userId',
  params: z.object({
    user_id: z.string(),
  }),
  responseSchema: TokenFcmSchemas.TokenFcmResponseSchema,
  tags: ['Report'],
});

export { createTokenFcmRoute, findTokenByUserIdRoute };
