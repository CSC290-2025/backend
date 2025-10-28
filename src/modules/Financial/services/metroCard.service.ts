import { NotFoundError } from '@/errors';
import { MetroCardModel } from '../models';
import type { MetroCard } from '../types';

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

export { getMetroCardById, createMetroCard, getUserMetroCards };
