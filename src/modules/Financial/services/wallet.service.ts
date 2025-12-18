import { NotFoundError, ValidationError } from '@/errors';
import { WalletModel } from '../models';
import type {
  Wallet,
  CreateWalletData,
  UpdateWalletData,
  OrganizationType,
} from '../types';

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
  amount: number,
  isVol: boolean
): Promise<{ status: string; transactionId?: number }> => {
  if (amount <= 0) {
    throw new ValidationError('Transfer amount must be positive');
  }

  if (fromUserId === toUserId) {
    throw new ValidationError('Cannot transfer funds to yourself');
  }

  const fromWallet = await WalletModel.findWalletByUserId(fromUserId);
  const toWallet = await WalletModel.findWalletByUserId(toUserId);

  if (!fromWallet) {
    throw new NotFoundError('Sender wallet not found');
  }
  if (!toWallet) {
    throw new NotFoundError('Recipient wallet not found');
  }

  if (fromWallet.status !== 'active') {
    throw new ValidationError(
      'Sender wallet is not active. Suspended wallets cannot send funds.'
    );
  }
  if (toWallet.status !== 'active') {
    throw new ValidationError(
      'Recipient wallet is not active. Suspended wallets cannot receive funds.'
    );
  }

  let detuctedAmount = amount;

  if (isVol) {
    const feePer = amount * 0.03;
    detuctedAmount = amount - feePer;
    const toAdmin = amount * feePer;

    await WalletModel.atomicTransferFunds(fromWallet.id, 19, toAdmin);
  }

  const result = await WalletModel.atomicTransferFunds(
    fromWallet.id,
    toWallet.id,
    detuctedAmount
  );

  // Return a transaction id (transfer_out) as the canonical id for tracking
  return { status: 'success', transactionId: result.fromTransactionId };
};

const updateWallet = async (
  id: number,
  data: UpdateWalletData
): Promise<Wallet> => {
  const existingWallet = await WalletModel.findWalletById(id);
  if (!existingWallet) throw new NotFoundError('Wallet not found');

  return await WalletModel.updateWallet(id, data);
};

const getUserWallets = async (userId: number): Promise<Wallet | null> => {
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

  return await WalletModel.WalletBalanceTopup(walletId, amount);
};

const getOrganizationBalance = async (
  organizationType: OrganizationType
): Promise<number> => {
  const wallet =
    await WalletModel.findWalletByOrganizationType(organizationType);

  return Number(wallet?.balance);
};

export {
  getWalletById,
  createWallet,
  updateWallet,
  getUserWallets,
  topUpBalance,
  transferFunds,
  getOrganizationBalance,
};
