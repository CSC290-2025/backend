import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { wallets } from '@/generated/prisma';
import type { Wallet, CreateWalletData, UpdateWalletData } from '../types';
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
  data: CreateWalletData
): Promise<Wallet> => {
  try {
    const wallet = await prisma.wallets.create({
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
const createTransaction = async (data: {
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
}): Promise<number> => {
  try {
    const transaction = await prisma.wallet_transactions.create({
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

const atomicTransferFunds = async (
  fromWalletId: number,
  toWalletId: number,
  amount: number
): Promise<{ fromWallet: Wallet; toWallet: Wallet }> => {
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

      return { fromWallet, toWallet };
    });

    return {
      fromWallet: transformWallet(result.fromWallet),
      toWallet: transformWallet(result.toWallet),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  createWallet,
  findWalletByUserId,
  findWalletById,
  updateWallet,
  WalletBalanceTopup,
  createTransaction,
  atomicTransferFunds,
};
