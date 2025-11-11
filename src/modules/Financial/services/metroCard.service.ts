import { NotFoundError, ValidationError } from '@/errors';
import { MetroCardModel, WalletModel } from '../models';
import type { MetroCard, UpdateMetroCardData } from '../types';
import prisma from '@/config/client';

const getMetroCardById = async (id: number): Promise<MetroCard> => {
  const wallet = await MetroCardModel.findMetroCardById(id);

  if (!wallet) throw new NotFoundError('Metro Card not found');

  return wallet;
};

const createMetroCard = async (user_id: number): Promise<MetroCard> => {
  return await MetroCardModel.createMetroCard(user_id);
};

const getUserMetroCards = async (userId: number): Promise<MetroCard[]> => {
  return await MetroCardModel.findMetroCardsByUserId(userId);
};

const updateMetroCard = async (
  id: number,
  data: UpdateMetroCardData
): Promise<MetroCard> => {
  const existingMetroCard = await MetroCardModel.findMetroCardById(id);

  if (!existingMetroCard) throw new NotFoundError('Metro Card not found');

  return await MetroCardModel.updateMetroCard(id, data);
};

const topUpBalance = async (
  metroCardId: number,
  walletId: number,
  amount: number
): Promise<MetroCard> => {
  if (amount <= 0) {
    throw new ValidationError('Amount must be positive');
  }

  const wallet = await WalletModel.findWalletById(walletId);

  const subtractedAmount = wallet.balance - amount;

  if (subtractedAmount < 0) {
    throw new ValidationError('Insufficient balance');
  }

  const existingMetroCard = await MetroCardModel.findMetroCardById(metroCardId);
  if (!existingMetroCard) {
    throw new NotFoundError('Metro card not found');
  }

  return await prisma.$transaction(async (trx) => {
    await WalletModel.updateWalletBalance(walletId, subtractedAmount, trx);

    return await MetroCardModel.updateMetroCardBalance(
      metroCardId,
      amount,
      'increment',
      trx
    );
  });
};

export {
  getMetroCardById,
  createMetroCard,
  getUserMetroCards,
  updateMetroCard,
  topUpBalance,
};
