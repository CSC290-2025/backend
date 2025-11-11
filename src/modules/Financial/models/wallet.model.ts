import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { wallets } from '@/generated/prisma';
import type { Wallet, CreateWalletData, UpdateWalletData } from '../types';

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

const incrementWalletBalanceTopup = async (
  id: number,
  amount: number
): Promise<Wallet> => {
  try {
    const wallet = await prisma.wallets.update({
      where: { id },
      data: {
        balance: {
          increment: amount,
        },
        updated_at: new Date(),
      },
    });
    return transformWallet(wallet);
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
      // Deduct from sender if sufficient balance
      const fromWallet = await tx.wallets.update({
        where: {
          id: fromWalletId,
          balance: { gte: amount },
        },
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
  incrementWalletBalanceTopup,
  atomicTransferFunds,
};
