import { z } from 'zod';
import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers';

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
  payerId: z.number(),
});

const ScbQrResponseSchema = z.object({
  qrResponse: z.object({
    status: z.object({
      code: z.number(),
      description: z.string(),
    }),
    data: z.object({
      qrRawData: z.string(),
      qrImage: z.string(),
    }),
  }),
});
// Webhook payload from SCB when payment is confirmed
const ScbWebhookPayloadSchema = z.object({
  payeeProxyId: z.string(),
  payeeProxyType: z.string(),
  payeeAccountNumber: z.string(),
  payeeName: z.string(),
  payerProxyId: z.string(),
  payerProxyType: z.string(),
  payerAccountNumber: z.string(),
  payerName: z.string(),
  sendingBankCode: z.string(),
  receivingBankCode: z.string(),
  amount: z.string(),
  channelCode: z.string(),
  transactionId: z.string(),
  transactionDateandTime: z.string(),
  billPaymentRef1: z.string(),
  billPaymentRef2: z.string(),
  billPaymentRef3: z.string(),
  currencyCode: z.string(),
  transactionType: z.string(),
});

const ScbQrParamsSchema = z.object({
  transRef: z.string(),
});

const ScbQrQuerySchema = z.object({
  sendingBank: z.string(),
});

const ScbQrConfirmResponseSchema = z.object({
  confirmation: z.object({
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

// Route: Create QR Code
const createQrRoute = createPostRoute({
  path: '/scb/qr/create',
  summary: 'Create new QR Code for payment',
  requestSchema: ScbQrRequestSchema,
  responseSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
      qrResponse: ScbQrResponseSchema,
    }),
  }),
  tags: ['SCB'],
});

// Route: SCB Webhook Listener (auto-called by SCB when payment is made)
const webhookRoute = createPostRoute({
  path: '/scb/webhook-listener',
  summary: 'SCB Payment Webhook Listener',
  requestSchema: ScbWebhookPayloadSchema,
  responseSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
      received: z.boolean(),
    }),
  }),
  tags: ['Auto-call. No need for manual testing'],
});

// Route: Confirm QR Payment Status
const confirmQrPayment = createGetRoute({
  path: '/scb/qr/confirm/{transRef}',
  summary: 'Confirm QR Code Payment Status',
  params: ScbQrParamsSchema,
  query: ScbQrQuerySchema,
  responseSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
      confirmation: ScbQrConfirmResponseSchema,
    }),
  }),
  tags: ['SCB'],
});

export const ScbSchemas = {
  ScbTokenSchema,
  ScbQrRequestSchema,
  ScbQrResponseSchema,
  ScbWebhookPayloadSchema,
  ScbQrParamsSchema,
  ScbQrQuerySchema,
  ScbQrConfirmResponseSchema,
  createQrRoute,
  webhookRoute,
  confirmQrPayment,
};
