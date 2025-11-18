import { NotFoundError, ValidationError } from '@/errors';
import { InsuranceCardModel, WalletModel } from '../models';
import type {
  InsuranceCard,
  CreateInsuranceCardData,
  TopUpInsuranceCardData,
} from '../types';
import prisma from '@/config/client';

const getCardById = async (id: number): Promise<InsuranceCard> => {
  const card = await InsuranceCardModel.findCardById(id);
  if (!card) throw new NotFoundError('Insurance card not found');
  return card;
};

const getCardByUserId = async (userId: number): Promise<InsuranceCard> => {
  const card = await InsuranceCardModel.findCardByUserId(userId);
  if (!card) throw new NotFoundError('User does not have an insurance card');
  return card;
};

const getCardsByUserId = async (userId: number): Promise<InsuranceCard[]> => {
  const cards = await InsuranceCardModel.findCardsByUserId(userId);
  return cards;
};

const createCard = async (
  data: CreateInsuranceCardData
): Promise<InsuranceCard> => {
  // Users can now have multiple insurance cards
  return await InsuranceCardModel.createCard(data);
};

const topUpFromWallet = async (
  cardId: number,
  data: TopUpInsuranceCardData
): Promise<{ card: InsuranceCard; transaction_id: number }> => {
  if (data.amount <= 0) {
    throw new ValidationError('Amount must be positive');
  }

  // Get insurance card
  const card = await InsuranceCardModel.findCardById(cardId);
  if (!card) {
    throw new NotFoundError('Insurance card not found');
  }

  // Get wallet
  const wallet = await WalletModel.findWalletById(data.wallet_id);
  if (!wallet) {
    throw new NotFoundError('Wallet not found');
  }

  // Verify wallet belongs to the same user as the card
  if (wallet.owner_id !== card.user_id) {
    throw new ValidationError(
      'Wallet does not belong to the insurance card owner'
    );
  }

  // Check sufficient balance
  if (wallet.balance < data.amount) {
    throw new ValidationError('Insufficient wallet balance');
  }

  // Perform transfer using transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      const newWalletBalance = wallet.balance - data.amount;
      await tx.wallets.update({
        where: { id: wallet.id },
        data: { balance: newWalletBalance, updated_at: new Date() },
      });

      // Add to insurance card
      const newCardBalance = card.balance + data.amount;
      const updatedCard = await tx.insurance_cards.update({
        where: { id: card.id },
        data: { balance: newCardBalance, updated_at: new Date() },
      });

      // Create transaction record
      const transaction = await tx.wallet_transactions.create({
        data: {
          wallet_id: wallet.id,
          transaction_type: 'transfer_to_service',
          amount: -data.amount, // Negative for deduction
          target_service: `insurance_card:${card.id}`,
          description: `Top-up to insurance card ${card.card_number}`,
        },
      });

      return {
        card: {
          ...updatedCard,
          user_id: updatedCard.user_id!,
          card_number: updatedCard.card_number!,
          balance: Number(updatedCard.balance || 0),
          status: updatedCard.status as 'active' | 'suspended',
        },
        transaction_id: transaction.id,
      };
    });

    return result;
  } catch (error) {
    throw new ValidationError(
      `Failed to process transfer: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export {
  getCardById,
  getCardByUserId,
  getCardsByUserId,
  createCard,
  topUpFromWallet,
};
