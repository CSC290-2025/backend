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
// Webhook payload from SCB when payment is confirmed
const ScbWebhookPayloadSchema = z
  .object({
    transactionId: z.string().optional(),
    amount: z.string().optional(),
    ref1: z.string().optional(),
    ref2: z.string().optional(),
    ref3: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough(); // Allow additional fields from SCB

const createQrRoute = createPostRoute({
  path: '/scb/qr/create',
  summary: 'Create new QR Code',
  requestSchema: ScbQrRequestSchema,
  responseSchema: ScbQrResponseSchema,
  tags: ['SCB'],
});

const webhookRoute = createPostRoute({
  path: '/scb/webhook-listener',
  summary: 'SCB Payment Webhook Listener',
  requestSchema: ScbWebhookPayloadSchema,
  responseSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  tags: ['SCB'],
});

export const ScbSchemas = {
  ScbTokenSchema,
  ScbQrRequestSchema,
  ScbQrResponseSchema,
  ScbWebhookPayloadSchema,
  createQrRoute,
  webhookRoute,
};
