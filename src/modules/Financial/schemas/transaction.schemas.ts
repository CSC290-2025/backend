import { createGetRoute } from '@/utils/openapi-helpers';
import { z } from 'zod';

const WalletTransactionSchema = z.object({
  id: z.number(),
  wallet_id: z.number().nullable(),
  transaction_type: z.string().nullable(),
  amount: z.number(),
  target_wallet_id: z.number().nullable(),
  target_service: z.string().nullable(),
  description: z.string().nullable(),
  created_at: z.date(),
});

const CardTransactionSchema = z.object({
  id: z.number(),
  card_id: z.number(),
  card_type: z.string().nullable(),
  transaction_type: z.string().nullable(),
  transaction_category: z.string().nullable(),
  reference: z.string().nullable(),
  amount: z.number(),
  description: z.string().nullable(),
  created_at: z.date(),
});

const getWalletTransactionRoute = createGetRoute({
  path: '/wallet-transactions/{transactionId}',
  summary: 'Get wallet transaction by ID',
  responseSchema: z.object({ transaction: WalletTransactionSchema }),
  params: z.object({ transactionId: z.coerce.number() }),
  tags: ['Transactions'],
});

const getCardTransactionRoute = createGetRoute({
  path: '/card-transactions/{cardTransactionId}',
  summary: 'Get card transaction by ID',
  responseSchema: z.object({ transaction: CardTransactionSchema }),
  params: z.object({ cardTransactionId: z.coerce.number() }),
  tags: ['Transactions'],
});

const getAllWalletTransactionsRoute = createGetRoute({
  path: '/wallet-transactions',
  summary: 'Get all wallet transactions',
  responseSchema: z.array(WalletTransactionSchema),
  tags: ['Transactions'],
});

const getAllCardTransactionsRoute = createGetRoute({
  path: '/card-transactions',
  summary: 'Get all card transactions',
  responseSchema: z.array(CardTransactionSchema),
  tags: ['Transactions'],
});

const getAllTransactionsRoute = createGetRoute({
  path: '/transactions',
  summary: 'Get all transactions (wallet + card)',
  responseSchema: z.object({
    wallet_transactions: z.array(WalletTransactionSchema),
    card_transactions: z.array(CardTransactionSchema),
  }),
  tags: ['Transactions'],
});

export const TransactionSchemas = {
  WalletTransactionSchema,
  CardTransactionSchema,
  getWalletTransactionRoute,
  getCardTransactionRoute,
  getAllWalletTransactionsRoute,
  getAllCardTransactionsRoute,
  getAllTransactionsRoute,
};
