import { NotFoundError, ValidationError } from '@/errors';
import { WalletModel } from '../models';
import type { Wallet, CreateWalletData, UpdateWalletData } from '../types';

const getWalletById = async (id: number): Promise<Wallet> => {
  const wallet = await WalletModel.findWalletById(id);
  if (!wallet) throw new NotFoundError('Wallet not found');
  return wallet;
};

const createWallet = async (data: CreateWalletData): Promise<Wallet> => {
  // Check if user already has a wallet
  const existingWallets = await WalletModel.findWalletsByUserId(data.user_id);
  if (existingWallets.length > 0) {
    throw new ValidationError(
      'User already has a wallet. Only one wallet per user is allowed.'
    );
  }

  return await WalletModel.createWallet(data.user_id, data);
};

const updateWallet = async (
  id: number,
  data: UpdateWalletData
): Promise<Wallet> => {
  const existingWallet = await WalletModel.findWalletById(id);
  if (!existingWallet) throw new NotFoundError('Wallet not found');

  return await WalletModel.updateWallet(id, data);
};

const getUserWallets = async (userId: number): Promise<Wallet[]> => {
  return await WalletModel.findWalletsByUserId(userId);
};

const topUpBalance = async (
  walletId: number,
  amount: number
): Promise<Wallet> => {
  if (amount <= 0) {
    throw new ValidationError('Amount must be positive');
  }

  const existingWallet = await WalletModel.findWalletById(walletId);
  if (!existingWallet) {
    throw new NotFoundError('Wallet not found');
  }

  const newBalance = existingWallet.balance + amount;

  return await WalletModel.updateWalletBalance(walletId, newBalance);
};

export {
  getWalletById,
  createWallet,
  updateWallet,
  getUserWallets,
  topUpBalance,
};
