import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
} from '@/utils/openapi-helpers';

//Enum
const OrganizationTypeEnum = z.enum([
  'Volunteer',
  'Transportation',
  'Healthcare',
]);

// Base
const WalletSchema = z.object({
  id: z.number(),
  owner_id: z.number(),
  wallet_type: z.enum(['individual', 'organization']),
  organization_type: z.string().nullable(),
  balance: z.number().default(0),
  status: z.enum(['active', 'suspended']),
  created_at: z.date(),
  updated_at: z.date(),
});

const CreateWalletSchema = z.object({
  user_id: z.number(),
  wallet_type: z.enum(['individual', 'organization']),
  organization_type: z.string().optional(),
});

const UpdateWalletSchema = z.object({
  wallet_type: z.enum(['individual', 'organization']).optional(),
  organization_type: z.string().optional(),
  status: z.enum(['active', 'suspended']).optional(),
});

const TopUpBalanceSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
});

const TransferFundsSchema = z.object({
  from_user_id: z.number(),
  to_user_id: z.number(),
  amount: z.number().positive('Amount must be positive'),
  isVol: z.boolean().optional().default(false),
});

const OrganizationTypeSchema = z.object({
  organizationType: OrganizationTypeEnum,
});

// Parameter schemas
const UserIdParam = z.object({
  userId: z.coerce.number(),
});

const WalletIdParam = z.object({
  walletId: z.coerce.number(),
});

const OrganizationTypeParam = z.object({
  organizationType: z.enum(['Volunteer', 'Transportation', 'Healthcare']),
});

// OpenAPI route
const createWalletRoute = createPostRoute({
  path: '/wallets',
  summary: 'Create new wallet',
  requestSchema: CreateWalletSchema,
  responseSchema: z.object({
    wallet: WalletSchema,
  }),
  tags: ['Wallets'],
});

const getUserWalletsRoute = createGetRoute({
  path: '/wallets/user/{userId}',
  summary: 'Get user wallet',
  responseSchema: z.object({
    wallet: WalletSchema.nullable(),
  }),
  params: UserIdParam,
  tags: ['Wallets'],
});

const getWalletRoute = createGetRoute({
  path: '/wallets/{walletId}',
  summary: 'Get wallet by ID',
  responseSchema: z.object({
    wallet: WalletSchema,
  }),
  params: WalletIdParam,
  tags: ['Wallets'],
});

const updateWalletRoute = createPutRoute({
  path: '/wallets/{walletId}',
  summary: 'Update wallet',
  requestSchema: UpdateWalletSchema,
  responseSchema: z.object({
    wallet: WalletSchema,
  }),
  params: WalletIdParam,
  tags: ['Wallets'],
});

const topUpBalanceRoute = createPostRoute({
  path: '/wallets/{walletId}/top-up',
  summary: 'Top up wallet balance',
  requestSchema: TopUpBalanceSchema,
  responseSchema: z.object({
    wallet: WalletSchema,
  }),
  params: WalletIdParam,
  tags: ['Wallets'],
});

const transferFundsRoute = createPostRoute({
  path: '/wallets/transfer',
  summary: 'Transfer funds between users',
  requestSchema: TransferFundsSchema,
  responseSchema: z.object({
    status: z.string(),
    transactionId: z.number().optional(),
  }),
  tags: ['Wallets'],
});

const getOrganizationBalanceRoute = createGetRoute({
  path: '/wallets/organization/{organizationType}/balance',
  summary: 'Get organization wallet balance',
  responseSchema: z.object({
    balance: z.number(),
    organizationType: OrganizationTypeEnum,
  }),
  params: OrganizationTypeParam,
  tags: ['Wallets'],
});

export const WalletSchemas = {
  OrganizationTypeEnum,
  WalletSchema,
  CreateWalletSchema,
  UpdateWalletSchema,
  TopUpBalanceSchema,
  TransferFundsSchema,
  UserIdParam,
  WalletIdParam,
  OrganizationTypeParam,
  createWalletRoute,
  getUserWalletsRoute,
  getWalletRoute,
  updateWalletRoute,
  topUpBalanceRoute,
  transferFundsRoute,
  getOrganizationBalanceRoute,
};
