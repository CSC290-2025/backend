import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';
import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers';

// Base schema
const InsuranceCardSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  balance: z.number().default(0),
  card_number: z.string(),
  status: z.enum(['active', 'suspended']),
  created_at: z.date(),
  updated_at: z.date(),
});

const CreateInsuranceCardSchema = z.object({
  user_id: z.number().positive('User ID must be positive'),
});

const TopUpInsuranceCardSchema = z.object({
  wallet_id: z.number().positive('Wallet ID must be positive'),
  amount: z.number().positive('Amount must be positive'),
});

// Parameter schemas
const UserIdParam = z.object({
  userId: z.coerce.number(),
});

const CardIdParam = z.object({
  cardId: z.coerce.number(),
});

// OpenAPI routes
const createInsuranceCardRoute = createPostRoute({
  path: '/insurance-cards',
  summary: 'Create new insurance card',
  requestSchema: CreateInsuranceCardSchema,
  responseSchema: z.object({
    card: InsuranceCardSchema,
  }),
  tags: ['Insurance Cards'],
});

const getUserInsuranceCardRoute = createGetRoute({
  path: '/insurance-cards/user/{userId}',
  summary: 'Get user insurance card',
  responseSchema: z.object({
    card: InsuranceCardSchema,
  }),
  params: UserIdParam,
  tags: ['Insurance Cards'],
});

const getInsuranceCardRoute = createGetRoute({
  path: '/insurance-cards/{cardId}',
  summary: 'Get insurance card by ID',
  responseSchema: z.object({
    card: InsuranceCardSchema,
  }),
  params: CardIdParam,
  tags: ['Insurance Cards'],
});

const topUpInsuranceCardRoute = createRoute({
  method: 'post',
  path: '/insurance-cards/{cardId}/top-up',
  summary: 'Top up insurance card from wallet',
  tags: ['Insurance Cards'],
  request: {
    params: CardIdParam,
    body: {
      content: {
        'application/json': { schema: TopUpInsuranceCardSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              card: InsuranceCardSchema,
              transaction_id: z.number(),
            }),
            message: z.string().optional(),
            timestamp: z.string(),
          }),
        },
      },
      description: 'Success',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.string(),
              message: z.string(),
              statusCode: z.number(),
            }),
            timestamp: z.string(),
          }),
        },
      },
      description: 'Bad request',
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.string(),
              message: z.string(),
              statusCode: z.number(),
            }),
            timestamp: z.string(),
          }),
        },
      },
      description: 'Not found',
    },
  },
});

export const InsuranceCardSchemas = {
  InsuranceCardSchema,
  CreateInsuranceCardSchema,
  TopUpInsuranceCardSchema,
  UserIdParam,
  CardIdParam,
  createInsuranceCardRoute,
  getUserInsuranceCardRoute,
  getInsuranceCardRoute,
  topUpInsuranceCardRoute,
};
