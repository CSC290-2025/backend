import { NotFoundError, ValidationError } from '@/errors';
import { MetroCardModel } from '../models';
import type { MetroCard, UpdateMetroCardData } from '../types';

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
  amount: number
): Promise<MetroCard> => {
  if (amount <= 0) {
    throw new ValidationError('Amount must be positive');
  }

  const existingMetroCard = await MetroCardModel.findMetroCardById(metroCardId);
  if (!existingMetroCard) {
    throw new NotFoundError('Metro card not found');
  }

  const newBalance = existingMetroCard.balance + amount;

  console.log(newBalance);

  return await MetroCardModel.updateMetroCardBalance(metroCardId, newBalance);
};

export {
  getMetroCardById,
  createMetroCard,
  getUserMetroCards,
  updateMetroCard,
  topUpBalance,
};
