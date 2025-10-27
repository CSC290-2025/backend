import { MetroCardModel } from '../models';
import type { MetroCard } from '../types';

const createMetroCard = async (user_id: number): Promise<MetroCard> => {
  return await MetroCardModel.createMetroCard(user_id);
};

export { createMetroCard };
