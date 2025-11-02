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

const ScbQrRequestSchema = z.object({
  qrType: z.string().default('PP'),
  amount: z.number(),
  ppType: z.string().default('BILLERID'),
  ppId: z.string().length(15),
  ref1: z.string().regex(/^[A-Z0-9]{20}$/),
  ref2: z.string().regex(/^[A-Z0-9]{20}$/),
  ref3: z
    .string()
    .regex(/^[A-Z0-9]{20}$/)
    .optional(),
  numberOfTimes: z.number().default(1),
  expiryDate: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) (?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/
    )
    .optional(),
});

const ScbQrResponseSchema = z.object({
  status: z.object({
    code: z.number(),
    description: z.string(),
  }),
  data: z.object({
    code: z.string(),
    message: z.string(),
    moreInfo: z.string(),
    success: z.boolean(),
    data: z.object({
      url: z.string(),
      qrRawData: z.string(),
      expiryDate: z.string(),
      numberOfTimes: z.number(),
    }),
    request: z.object({
      qrType: z.string(),
      amount: z.number(),
      ppType: z.string(),
      ppId: z.string(),
      ref1: z.string(),
      ref2: z.string(),
      ref3: z.string().optional(),
      expiryDate: z.string(),
      numberOfTimes: z.number(),
    }),
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
