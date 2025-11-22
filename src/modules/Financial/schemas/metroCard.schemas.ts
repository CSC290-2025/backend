import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { authMiddleware } from '@/middlewares';
import { z } from 'zod';

const MetroCardSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  balance: z.number().default(0),
  card_number: z.string(),
  status: z.enum(['active', 'suspended']),
  created_at: z.date(),
  updated_at: z.date(),
});

const CreateMetroCardSchema = z.object({});

const UpdateMetroCardSchema = z.object({
  status: z.enum(['active', 'suspended']).optional(),
});

const TopUpMetroCardSchema = z.object({
  cardNumber: z.string(),
  walletId: z.number(),
  amount: z.number(),
});

const TransferToTransportationSchema = z.object({
  cardNumber: z.string(),
  amount: z.number(),
});

const MetroCardListSchema = z.object({
  metroCards: z.array(MetroCardSchema),
});

//Parameter Schema
const UserIdParam = z.object({
  userId: z.coerce.number(),
});

const MetroCardIdParam = z.object({
  metroCardId: z.coerce.number(),
});

// OpenAPI route
const createMetroCardRoute = createPostRoute({
  path: '/metro-cards',
  summary: 'Create new metro card',
  requestSchema: CreateMetroCardSchema,
  responseSchema: MetroCardSchema,
  tags: ['MetroCards'],
  middleware: [authMiddleware],
});

const getUserMetroCardRoute = createGetRoute({
  path: '/metro-cards/user/{userId}',
  summary: 'Get user metro cards',
  responseSchema: MetroCardListSchema,
  params: UserIdParam,
  tags: ['MetroCards'],
});

const getMetroCardRoute = createGetRoute({
  path: '/metro-cards/{metroCardId}',
  summary: 'Get metro card by ID',
  responseSchema: MetroCardSchema,
  params: MetroCardIdParam,
  tags: ['MetroCards'],
});

const updateMetroCardRoute = createPutRoute({
  path: '/metro-cards/{metroCardId}',
  summary: 'Update metro card',
  requestSchema: UpdateMetroCardSchema,
  responseSchema: MetroCardSchema,
  params: MetroCardIdParam,
  tags: ['MetroCards'],
});

const topUpBalanceRoute = createPostRoute({
  path: '/metro-cards/top-up',
  summary: 'Top up metro card balance',
  requestSchema: TopUpMetroCardSchema,
  responseSchema: z.object({
    metroCard: MetroCardSchema,
    cardTransactionId: z.number().optional(),
  }),
  tags: ['MetroCards'],
});

const deleteMetroCardRoute = createDeleteRoute({
  path: '/metro-cards/{metroCardId}',
  summary: 'Delete metro card by ID',
  params: MetroCardIdParam,
  tags: ['MetroCards'],
  middleware: [authMiddleware],
});

const transferToTransportationRoute = createPostRoute({
  path: '/metro-cards/transfer-to-transportation',
  summary: 'Transfer metro card balance to transportation organization',
  requestSchema: TransferToTransportationSchema,
  responseSchema: z.object({
    metroCard: MetroCardSchema,
    cardTransactionId: z.number().optional(),
  }),
  tags: ['MetroCards'],
});

const getMeMetroCardsRoute = createGetRoute({
  path: '/metro-cards/me',
  summary: 'Get my metro cards',
  responseSchema: MetroCardListSchema,
  tags: ['MetroCards'],
  middleware: [authMiddleware],
});

export const MetroCardSchemas = {
  MetroCardSchema,
  CreateMetroCardSchema,
  UpdateMetroCardSchema,
  TopUpMetroCardSchema,
  TransferToTransportationSchema,
  MetroCardListSchema,
  UserIdParam,
  MetroCardIdParam,
  createMetroCardRoute,
  getUserMetroCardRoute,
  getMetroCardRoute,
  updateMetroCardRoute,
  topUpBalanceRoute,
  deleteMetroCardRoute,
  transferToTransportationRoute,
  getMeMetroCardsRoute,
};
