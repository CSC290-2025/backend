import { NotFoundError } from '@/errors';
import { WalletModel } from '../models';
import type { Wallet } from '../types';

const getWalletById = async (id: number): Promise<Wallet> => {
  const wallet = await WalletModel.findWalletById(id);
  if (!wallet) throw new NotFoundError('Wallet not found');
  return wallet;
};

export { getWalletById };
