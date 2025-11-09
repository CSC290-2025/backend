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
  const existingWallet = await WalletModel.findWalletByUserId(data.user_id);
  if (existingWallet) {
    throw new ValidationError(
      'User already has a wallet. Only one wallet per user is allowed.'
    );
  }

  return await WalletModel.createWallet(data.user_id, data);
};
const transferFunds = async (
  fromUserId: number,
  toUserId: number,
  amount: number
): Promise<{ status: string }> => {
  if (amount <= 0) {
    throw new ValidationError('Transfer amount must be positive');
  }

  const fromWallet = await WalletModel.findWalletByUserId(fromUserId);
  const toWallet = await WalletModel.findWalletByUserId(toUserId);

  if (!fromWallet) {
    throw new NotFoundError('Sender wallet not found');
  }
  if (!toWallet) {
    throw new NotFoundError('Recipient wallet not found');
  }

  if (fromWallet.balance < amount) {
    throw new ValidationError('Insufficient funds');
  }

  await WalletModel.updateWalletBalance(
    fromWallet.id,
    fromWallet.balance - amount
  );
  await WalletModel.updateWalletBalance(toWallet.id, toWallet.balance + amount);

  return { status: 'success' };
};

const updateWallet = async (
  id: number,
  data: UpdateWalletData
): Promise<Wallet> => {
  const existingWallet = await WalletModel.findWalletById(id);
  if (!existingWallet) throw new NotFoundError('Wallet not found');

  return await WalletModel.updateWallet(id, data);
};

const getUserWallets = async (userId: number): Promise<Wallet> => {
  return await WalletModel.findWalletByUserId(userId);
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
  transferFunds,
};
