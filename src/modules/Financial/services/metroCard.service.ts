import { ForbiddenError, NotFoundError, ValidationError } from '@/errors';
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

  if (existingMetroCard?.status === 'suspended')
    throw new ForbiddenError('This card is suspended');

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

  const existingMetroCard = await MetroCardModel.findMetroCardById(metroCardId);

  if (!existingMetroCard) {
    throw new NotFoundError('Metro card not found');
  }

  if (existingMetroCard.status === 'suspended')
    throw new ForbiddenError('This card is suspended');

  return await prisma.$transaction(async (trx) => {
    const updatedWallet = await WalletModel.WalletBalanceTopup(
      walletId,
      amount,
      'decrement',
      trx
    );

    if (updatedWallet.balance < 0) {
      throw new ValidationError('Insufficient balance');
    }

    const updatedMetroCard = await MetroCardModel.updateMetroCardBalance(
      metroCardId,
      amount,
      'increment',
      trx
    );

    return updatedMetroCard;
  });
};

export {
  getMetroCardById,
  createMetroCard,
  getUserMetroCards,
  updateMetroCard,
  topUpBalance,
};
