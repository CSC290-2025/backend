import { z } from 'zod';
import { createPostRoute } from '@/utils/openapi-helpers';

// accessToken = The OAuth access token issued by SCB
// tokenType = The type of the token issued "Bearer"
const ScbTokenSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  expiresAt: z.number(),
});

// User only provides amount - everything else is auto-generated
const ScbQrRequestSchema = z.object({
  amount: z.string().max(13),
});

const ScbQrResponseSchema = z.object({
  status: z.object({
    code: z.number(),
    description: z.string(),
  }),
  data: z.object({
    qrRawData: z.string(),
    qrImage: z.string(),
  }),
});
const createQrRoute = createPostRoute({
  path: '/scb/qr/create',
  summary: 'Create new QR Code',
  requestSchema: ScbQrRequestSchema,
  responseSchema: ScbQrResponseSchema,
  tags: ['Wallets'],
});

export const ScbSchemas = {
  ScbTokenSchema,
  ScbQrRequestSchema,
  ScbQrResponseSchema,
  createQrRoute,
};
