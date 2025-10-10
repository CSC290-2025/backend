import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Wallet, CreateWalletData } from '../types';

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
    return {
      ...wallet,
      owner_id: wallet.owner_id!,
      wallet_type: wallet.wallet_type as 'individual' | 'organization',
      balance: Number(wallet.balance || 0),
      status: wallet.status as 'active' | 'suspended',
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWalletsByUserId = async (userId: number): Promise<Wallet[]> => {
  try {
    const wallets = await prisma.wallets.findMany({
      where: { owner_id: userId },
    });
    return wallets.map((wallet) => ({
      ...wallet,
      owner_id: wallet.owner_id!,
      wallet_type: wallet.wallet_type as 'individual' | 'organization',
      balance: Number(wallet.balance || 0),
      status: wallet.status as 'active' | 'suspended',
    }));
  } catch (error) {
    handlePrismaError(error);
  }
};

const findWalletById = async (id: number): Promise<Wallet | null> => {
  try {
    const wallet = await prisma.wallets.findUnique({
      where: { id },
    });
    return wallet
      ? {
          ...wallet,
          owner_id: wallet.owner_id!,
          wallet_type: wallet.wallet_type as 'individual' | 'organization',
          balance: Number(wallet.balance || 0),
          status: wallet.status as 'active' | 'suspended',
        }
      : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateWallet = async (id: number, data: any): Promise<Wallet> => {
  try {
    const wallet = await prisma.wallets.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return {
      ...wallet,
      owner_id: wallet.owner_id!,
      wallet_type: wallet.wallet_type as 'individual' | 'organization',
      balance: Number(wallet.balance || 0),
      status: wallet.status as 'active' | 'suspended',
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateWalletBalance = async (
  id: number,
  balance: number
): Promise<Wallet> => {
  try {
    const wallet = await prisma.wallets.update({
      where: { id },
      data: {
        balance,
        updated_at: new Date(),
      },
    });
    return {
      ...wallet,
      owner_id: wallet.owner_id!,
      wallet_type: wallet.wallet_type as 'individual' | 'organization',
      balance: Number(wallet.balance || 0),
      status: wallet.status as 'active' | 'suspended',
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  createWallet,
  findWalletsByUserId,
  findWalletById,
  updateWallet,
  updateWalletBalance,
};
