import { ForbiddenError, NotFoundError, ValidationError } from '@/errors';
import { MetroCardModel, WalletModel } from '../models';
import type { MetroCard, UpdateMetroCardData } from '../types';
import prisma from '@/config/client';
import { hashCardNumber, normalizeCardNumber } from '../utils';

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
  cardNumber: string,
  walletId: number,
  amount: number
): Promise<MetroCard> => {
  if (amount <= 0) {
    throw new ValidationError('Amount must be positive');
  }

  const normalizedCardNumber = normalizeCardNumber(cardNumber);

  const hashedCardNumber = hashCardNumber(normalizedCardNumber);

  const existingMetroCard =
    await MetroCardModel.findMetroCardByHash(hashedCardNumber);

  if (!existingMetroCard) {
    throw new NotFoundError('Metro card not found');
  }

  if (existingMetroCard.status === 'suspended')
    throw new ForbiddenError('This card is suspended');

  // Pre-check wallet balance before transaction
  const wallet = await WalletModel.findWalletById(walletId);
  if (!wallet) {
    throw new NotFoundError('Wallet not found');
  }
  if (wallet.balance < amount) {
    throw new ValidationError('Insufficient balance');
  }

  return await prisma.$transaction(async (trx) => {
    await WalletModel.WalletBalanceTopup(walletId, amount, 'decrement', trx);
    // Log transfer from user wallet to metro card
    await WalletModel.createTransaction(
      {
        wallet_id: walletId,
        transaction_type: 'transfer_to_service',
        amount: -amount,
        target_service: `metro_card:${existingMetroCard.id}`,
        description: `Top-up to metro card ${existingMetroCard.card_number}`,
      },
      trx
    );
    const updatedMetroCard = await MetroCardModel.updateMetroCardBalance(
      existingMetroCard.id,
      amount,
      'increment',
      trx
    );

    return updatedMetroCard;
  });
};

const deleteMetroCardById = async (id: number): Promise<void> => {
  const existingMetroCard = await MetroCardModel.findMetroCardById(id);

  if (!existingMetroCard) throw new NotFoundError('Metro Card not found');

  await MetroCardModel.deleteMetroCard(id);
};

const transferToTransportation = async (
  cardNumber: string,
  amount: number
): Promise<MetroCard> => {
  if (amount <= 0) {
    throw new ValidationError('Amount must be positive');
  }

  const normalizedCardNumber = normalizeCardNumber(cardNumber);
  const hashedCardNumber = hashCardNumber(normalizedCardNumber);

  const existingMetroCard =
    await MetroCardModel.findMetroCardByHash(hashedCardNumber);

  if (!existingMetroCard) {
    throw new NotFoundError('Metro card not found');
  }

  if (existingMetroCard.status === 'suspended')
    throw new ForbiddenError('This card is suspended');

  if (existingMetroCard.balance < amount) {
    throw new ValidationError('Insufficient metro card balance');
  }

  const transportationWallet =
    await WalletModel.findWalletByOrganizationType('Transportation');
  if (!transportationWallet) {
    throw new NotFoundError('Transportation wallet not found');
  }

  return await prisma.$transaction(async (trx) => {
    const updatedMetroCard = await MetroCardModel.updateMetroCardBalance(
      existingMetroCard.id,
      amount,
      'decrement',
      trx
    );
    await WalletModel.WalletBalanceTopup(
      transportationWallet.id,
      amount,
      'increment',
      trx
    );

    // Record a transaction for the organization receiving the funds
    await WalletModel.createTransaction(
      {
        wallet_id: transportationWallet.id,
        transaction_type: 'transfer_in',
        amount: amount,
        target_service: 'transportation',
        description: `Transfer from metro card ${existingMetroCard.card_number}`,
      },
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
  deleteMetroCardById,
  transferToTransportation,
};
