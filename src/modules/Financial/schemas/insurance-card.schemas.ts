import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { authMiddleware } from '@/middlewares';

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

const CreateInsuranceCardSchema = z.object({});

const TopUpInsuranceCardSchema = z.object({
  cardNumber: z.string(),
  wallet_id: z.number().positive('Wallet ID must be positive'),
  amount: z.number().positive('Amount must be positive'),
});

const UpdateInsuranceCardSchema = z.object({
  status: z.enum(['active', 'suspended']).optional(),
});

// Response schemas
const GetInsuranceCardResponseSchema = z.object({
  card: InsuranceCardSchema,
});

const GetInsuranceCardsResponseSchema = z.object({
  cards: z.array(InsuranceCardSchema),
});

const CreateInsuranceCardResponseSchema = z.object({
  card: InsuranceCardSchema,
});

const TopUpInsuranceCardResponseSchema = z.object({
  card: InsuranceCardSchema,
  transaction_id: z.number(),
});

const UpdateInsuranceCardResponseSchema = z.object({
  card: InsuranceCardSchema,
});

const TransferToHealthCareSchema = z.object({
  cardNumber: z.string(),
  amount: z.number(),
});

// Parameter schemas
const UserIdParam = z.object({
  userId: z.coerce.number(),
});

const InsuranceCardIdParam = z.object({
  insuranceCardId: z.coerce.number(),
});

const CardNumberParam = z.object({
  cardNumber: z.string(),
});

// OpenAPI routes
const createInsuranceCardRoute = createPostRoute({
  path: '/insurance-cards',
  summary: 'Create new insurance card',
  requestSchema: CreateInsuranceCardSchema,
  responseSchema: InsuranceCardSchema,
  tags: ['Insurance Cards'],
  middleware: [authMiddleware],
  operationId: 'useCreateInsuranceCard',
});

const getMeInsuranceCardsRoute = createGetRoute({
  path: '/insurance-cards/me',
  summary: 'Get my insurance cards',
  responseSchema: z.object({
    insuranceCards: z.array(InsuranceCardSchema),
  }),
  tags: ['Insurance Cards'],
  middleware: [authMiddleware],
  operationId: 'useGetMyInsuranceCards',
});

const getInsuranceCardRoute = createGetRoute({
  path: '/insurance-cards/{insuranceCardId}',
  summary: 'Get insurance card by ID',
  responseSchema: InsuranceCardSchema,
  params: InsuranceCardIdParam,
  tags: ['Insurance Cards'],
  middleware: [authMiddleware],
  operationId: 'useGetInsuranceCardById',
});

const topUpInsuranceCardRoute = createPostRoute({
  path: '/insurance-cards/top-up',
  summary: 'Top up insurance card from wallet',
  requestSchema: TopUpInsuranceCardSchema,
  responseSchema: z.object({
    insuranceCard: InsuranceCardSchema,
    transaction_id: z.number(),
  }),
  tags: ['Insurance Cards'],
  middleware: [authMiddleware],
  operationId: 'useTopUpInsuranceCard',
});

const getUserInsuranceCardsRoute = createGetRoute({
  path: '/insurance-cards/user/{userId}',
  summary: 'Get user insurance cards',
  responseSchema: z.object({
    insuranceCards: z.array(InsuranceCardSchema),
  }),
  params: UserIdParam,
  tags: ['Insurance Cards'],
  middleware: [authMiddleware],
  operationId: 'useGetUserInsuranceCards',
});

const updateInsuranceCardRoute = createPutRoute({
  path: '/insurance-cards/{insuranceCardId}',
  summary: 'Update insurance card',
  requestSchema: UpdateInsuranceCardSchema,
  responseSchema: InsuranceCardSchema,
  params: InsuranceCardIdParam,
  tags: ['Insurance Cards'],
  middleware: [authMiddleware],
  operationId: 'useUpdateInsuranceCard',
});

const deleteMyInsuranceCardRoute = createDeleteRoute({
  path: '/insurance-cards/{insuranceCardId}',
  summary: 'Delete my insurance card',
  params: InsuranceCardIdParam,
  tags: ['Insurance Cards'],
  middleware: [authMiddleware],
  operationId: 'useDeleteMyInsuranceCard',
});

const transferToHealthCareRoute = createPostRoute({
  path: '/insurance-cards/transfer-to-healthcare',
  summary: 'Transfer insurance card balance to healthcare organization',
  requestSchema: TransferToHealthCareSchema,
  responseSchema: z.object({
    insuranceCard: InsuranceCardSchema,
    cardTransactionId: z.number().optional(),
  }),
  tags: ['Insurance Cards'],
  middleware: [authMiddleware],
  operationId: 'useTransferToHealthCare',
});

export const InsuranceCardSchemas = {
  InsuranceCardSchema,
  CreateInsuranceCardSchema,
  TopUpInsuranceCardSchema,
  TransferToHealthCareSchema,
  UpdateInsuranceCardSchema,
  GetInsuranceCardResponseSchema,
  GetInsuranceCardsResponseSchema,
  CreateInsuranceCardResponseSchema,
  TopUpInsuranceCardResponseSchema,
  UpdateInsuranceCardResponseSchema,
  UserIdParam,
  InsuranceCardIdParam,
  CardNumberParam,
  createInsuranceCardRoute,
  getMeInsuranceCardsRoute,
  getInsuranceCardRoute,
  topUpInsuranceCardRoute,
  getUserInsuranceCardsRoute,
  updateInsuranceCardRoute,
  deleteMyInsuranceCardRoute,
  transferToHealthCareRoute,
};
