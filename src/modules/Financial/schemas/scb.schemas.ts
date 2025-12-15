import { z } from 'zod';
import { createPostRoute, createGetRoute } from '@/utils/openapi-helpers';

// accessToken = The OAuth access token issued by SCB
// tokenType = The type of the token issued "Bearer"
const ScbTokenSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  expiresAt: z.number(),
});

// User provides amount and user_id
const ScbQrRequestSchema = z.object({
  amount: z.string().max(13),
  user_id: z.number(),
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

const ScbQrCreateRequestSchema = z.object({
  qrType: z.string(),
  ppType: z.string(),
  ppId: z.string(),
  amount: z.string(),
  ref1: z.string(),
  ref2: z.string(),
  ref3: z.string(),
});

const ScbQrCreateResponseSchema = z.object({
  status: z.object({
    code: z.number(),
    description: z.string(),
  }),
  data: z.object({
    qrRawData: z.string(),
    qrImage: z.string(),
  }),
});

const ScbVerifyScbRequestSchema = z.object({
  transRef: z.string(),
  sendingBank: z.string(),
});

const ScbVerifyScbResponseSchema = z.object({
  status: z.object({
    code: z.number(),
    description: z.string(),
  }),
  data: z.object({
    transRef: z.string(),
    sendingBank: z.string(),
    receivingBank: z.string(),
    transDate: z.string(),
    transTime: z.string(),
    sender: z.object({
      displayName: z.string(),
      name: z.string(),
      proxy: z.object({
        type: z.string(),
        value: z.string(),
      }),
      account: z.object({
        type: z.string(),
        value: z.string(),
      }),
    }),
    receiver: z.object({
      displayName: z.string(),
      name: z.string(),
      proxy: z.object({
        type: z.string(),
        value: z.string(),
      }),
      account: z.object({
        type: z.string(),
        value: z.string(),
      }),
    }),
    amount: z.string(),
    paidLocalAmount: z.string(),
    paidLocalCurrency: z.string(),
    countryCode: z.string(),
    ref1: z.string(),
    ref2: z.string(),
    ref3: z.string(),
  }),
});

const ScbOAuthResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    tokenType: z.string(),
    expiresIn: z.number(),
  }),
});

const ScbQrApiResponseSchema = z.object({
  statusCode: z.number(),
  description: z.string(),
  qrRawData: z.string(),
  user_id: z.number(),
  amount: z.string(),
  ref1: z.string(),
});
const ScbWebhookRequestSchema = z.object({
  transactionId: z.string().optional(),
  sendingBank: z.string().optional(),
  reference1: z.string().optional(),
});

const ScbWebhookResponseSchema = z.object({
  status: z.string(),
});

const ScbVerifyQuerySchema = z.object({
  ref1: z.string(),
});

const ScbVerifyResponseSchema = z.object({
  statusCode: z.number(),
  description: z.string(),
  amount: z.string(),
  userid: z.number(),
  ref1: z.string(),
});
const createQrRoute = createPostRoute({
  path: '/scb/qr/create',
  summary: 'Create new QR Code',
  requestSchema: ScbQrRequestSchema,
  responseSchema: ScbQrApiResponseSchema,
  tags: ['SCB'],
});

const paymentConfirmRoute = createPostRoute({
  path: '/scb/payment-confirm',
  summary:
    'Confirm payment from SCB webhook [NO NEED TO CALL BY US - AUTOCALL BY SBC]',
  requestSchema: ScbWebhookRequestSchema,
  responseSchema: ScbWebhookResponseSchema,
  tags: ['SCB'],
});

const verifyPaymentRoute = createGetRoute({
  path: '/scb/verify-payment',
  summary: 'Verify payment with SCB',
  query: ScbVerifyQuerySchema,
  responseSchema: ScbVerifyResponseSchema,
  tags: ['SCB'],
});

export const ScbSchemas = {
  ScbTokenSchema,
  ScbQrRequestSchema,
  ScbQrResponseSchema,
  ScbQrApiResponseSchema,
  createQrRoute,
  ScbWebhookRequestSchema,
  ScbWebhookResponseSchema,
  paymentConfirmRoute,
  ScbVerifyQuerySchema,
  ScbVerifyResponseSchema,
  verifyPaymentRoute,
  ScbQrCreateRequestSchema,
  ScbQrCreateResponseSchema,
  ScbVerifyScbRequestSchema,
  ScbVerifyScbResponseSchema,
  ScbOAuthResponseSchema,
};
