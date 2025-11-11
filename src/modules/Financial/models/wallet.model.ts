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

// const updateWalletBalance = async (
//   id: number,
//   balance: number
// ): Promise<Wallet> => {
//   try {
//     const wallet = await prisma.wallets.update({
//       where: { id },
//       data: {
//         balance,
//         updated_at: new Date(),
//       },
//     });
//     return transformWallet(wallet);
//   } catch (error) {
//     handlePrismaError(error);
//   }
// };

const incrementWalletBalance = async (
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
export {
  createWallet,
  findWalletByUserId,
  findWalletById,
  updateWallet,
  incrementWalletBalance,
};
