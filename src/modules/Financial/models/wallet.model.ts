import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { wallets, wallet_transactions } from '@/generated/prisma';
import type {
  Wallet,
  CreateWalletData,
  UpdateWalletData,
  OrganizationType,
} from '../types';
import type { Prisma } from '@prisma/client/scripts/default-index';

// Helper to DRY
const transformWallet = (wallet: wallets): Wallet => ({
  ...wallet,
  owner_id: wallet.owner_id!,
  wallet_type: wallet.wallet_type as 'individual' | 'organization',
  balance: Number(wallet.balance || 0),
  status: wallet.status as 'active' | 'suspended',
});

// Wallet operations
const createWallet = async (
  ownerId: number,
  data: CreateWalletData,
  tx?: Prisma.TransactionClient
): Promise<Wallet> => {
  try {
    const wallet = await (tx ?? prisma).wallets.create({
      data: {
        owner_id: ownerId,
        wallet_type: data.wallet_type,
        organization_type: data.organization_type || null,
        balance: 0,
        status: 'active',
      },
    });
    return transformWallet(wallet);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWalletByUserId = async (userId: number): Promise<Wallet | null> => {
  try {
    const wallet = await prisma.wallets.findFirst({
      where: { owner_id: userId },
    });
    return wallet ? transformWallet(wallet) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWalletById = async (id: number): Promise<Wallet> => {
  try {
    const wallet = await prisma.wallets.findUniqueOrThrow({
      where: { id },
    });
    return transformWallet(wallet);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWalletByOrganizationType = async (
  organizationType: OrganizationType
): Promise<Wallet | null> => {
  try {
    const wallet = await prisma.wallets.findFirst({
      where: {
        wallet_type: 'organization',
        organization_type: organizationType,
      },
    });
    return wallet ? transformWallet(wallet) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateWallet = async (
  id: number,
  data: UpdateWalletData
): Promise<Wallet> => {
  try {
    const wallet = await prisma.wallets.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return transformWallet(wallet);
  } catch (error) {
    handlePrismaError(error);
  }
};

const WalletBalanceTopup = async (
  id: number,
  balance: number,
  operation: 'increment' | 'decrement' = 'increment',
  trx?: Prisma.TransactionClient
): Promise<Wallet> => {
  try {
    const wallet = await (trx ?? prisma).wallets.update({
      where: { id },
      data: {
        balance: {
          [operation]: balance,
        },
        updated_at: new Date(),
      },
    });
    return transformWallet(wallet);
  } catch (error) {
    handlePrismaError(error);
  }
};

// Transaction operations
const createTransaction = async (
  data: {
    wallet_id: number;
    transaction_type:
      | 'top_up'
      | 'transfer_in'
      | 'transfer_out'
      | 'transfer_to_service';
    amount: number;
    target_wallet_id?: number;
    target_service?: string;
    description?: string;
  },
  trx?: Prisma.TransactionClient
): Promise<number> => {
  try {
    // The core logic: Use the passed-in transaction client (trx) if available,
    // otherwise fall back to the global Prisma client.
    const transaction = await (trx ?? prisma).wallet_transactions.create({
      data: {
        wallet_id: data.wallet_id,
        transaction_type: data.transaction_type,
        amount: data.amount,
        target_wallet_id: data.target_wallet_id || null,
        target_service: data.target_service || null,
        description: data.description || null,
      },
    });
    return transaction.id;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWalletTransactionById = async (
  id: number
): Promise<wallet_transactions> => {
  try {
    const transaction = await prisma.wallet_transactions.findUniqueOrThrow({
      where: { id },
    });
    return transaction;
  } catch (error) {
    handlePrismaError(error);
  }
};

// Return all transactions (basic, no pagination for now). Order by newest first.
const findAllWalletTransactions = async (): Promise<wallet_transactions[]> => {
  try {
    const transactions = await prisma.wallet_transactions.findMany({
      orderBy: { created_at: 'desc' },
    });
    return transactions;
  } catch (error) {
    handlePrismaError(error);
  }
};

const atomicTransferFunds = async (
  fromWalletId: number,
  toWalletId: number,
  amount: number
): Promise<{
  fromWallet: Wallet;
  toWallet: Wallet;
  fromTransactionId: number;
  toTransactionId: number;
}> => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const senderWallet = await tx.wallets.findUnique({
        where: { id: fromWalletId },
        select: { balance: true },
      });

      if (!senderWallet) {
        throw new Error('Sender wallet not found');
      }

      if (Number(senderWallet.balance) < amount) {
        throw new Error('Insufficient balance for transfer');
      }

      // Deduct from sender if sufficient balance
      const fromWallet = await tx.wallets.update({
        where: { id: fromWalletId },
        data: {
          balance: { decrement: amount },
          updated_at: new Date(),
        },
      });

      const toWallet = await tx.wallets.update({
        where: { id: toWalletId },
        data: {
          balance: { increment: amount },
          updated_at: new Date(),
        },
      });
      // for the vibe where in a wallet you can check all the incoming to your wallet in one column
      // and also all the outgoing from your wallet in another column separately

      const fromTransaction = await tx.wallet_transactions.create({
        data: {
          wallet_id: fromWalletId,
          transaction_type: 'transfer_out',
          amount: amount,
          target_wallet_id: toWalletId,
          target_service: 'peer_transfer',
          description: `Transfer to wallet ${toWalletId}`,
        },
      });

      const toTransaction = await tx.wallet_transactions.create({
        data: {
          wallet_id: toWalletId,
          transaction_type: 'transfer_in',
          amount: amount,
          target_wallet_id: fromWalletId,
          target_service: 'peer_transfer',
          description: `Transfer from wallet ${fromWalletId}`,
        },
      });

      return {
        fromWallet,
        toWallet,
        fromTransactionId: fromTransaction.id,
        toTransactionId: toTransaction.id,
      };
    });

    return {
      fromWallet: transformWallet(result.fromWallet),
      toWallet: transformWallet(result.toWallet),
      fromTransactionId: result.fromTransactionId,
      toTransactionId: result.toTransactionId,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  createWallet,
  findWalletByUserId,
  findWalletById,
  findWalletByOrganizationType,
  updateWallet,
  WalletBalanceTopup,
  createTransaction,
  findWalletTransactionById,
  findAllWalletTransactions,
  atomicTransferFunds,
};
