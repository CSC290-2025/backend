import { ForbiddenError, NotFoundError, ValidationError } from '@/errors';
import { InsuranceCardModel, WalletModel } from '../models';
import type { InsuranceCard } from '../types';
import prisma from '@/config/client';
import { formatInsuranceCardNumber } from '../utils/crypto';

const getCardById = async (id: number): Promise<InsuranceCard> => {
  const card = await InsuranceCardModel.findCardById(id);
  if (!card) throw new NotFoundError('Insurance card not found');
  return card;
};

const getCardByCardNumber = async (
  cardNumber: string
): Promise<InsuranceCard> => {
  const formattedCardNumber = formatInsuranceCardNumber(cardNumber);
  const card =
    await InsuranceCardModel.findCardByCardNumber(formattedCardNumber);
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

const createCard = async (userId: number): Promise<InsuranceCard> => {
  // Users can now have multiple insurance cards
  return await InsuranceCardModel.createCard(userId);
};

const topUpFromWallet = async (
  cardNumber: string,
  walletId: number,
  amount: number
): Promise<{ card: InsuranceCard; transaction_id: number }> => {
  if (amount <= 0) {
    throw new ValidationError('Amount must be positive');
  }

  // Get insurance card
  const formattedCardNumber = formatInsuranceCardNumber(cardNumber);
  const card =
    await InsuranceCardModel.findCardByCardNumber(formattedCardNumber);
  if (!card) {
    throw new NotFoundError('Insurance card not found');
  }

  // Get wallet
  const wallet = await WalletModel.findWalletById(walletId);
  if (!wallet) {
    throw new NotFoundError('Wallet not found');
  }

  // Check sufficient balance
  if (wallet.balance < amount) {
    throw new ValidationError('Insufficient wallet balance');
  }

  // Perform transfer using transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      const newWalletBalance = wallet.balance - amount;
      await tx.wallets.update({
        where: { id: wallet.id },
        data: { balance: newWalletBalance, updated_at: new Date() },
      });

      // Add to insurance card
      const newCardBalance = card.balance + amount;
      const updatedCard = await tx.insurance_cards.update({
        where: { id: card.id },
        data: { balance: newCardBalance, updated_at: new Date() },
      });

      // Create transaction record
      const transaction = await tx.wallet_transactions.create({
        data: {
          wallet_id: wallet.id,
          transaction_type: 'transfer_to_service',
          amount: amount,
          target_service: `insurance_card:${card.id}`,
          description: `Top-up to insurance card ${card.card_number}`,
        },
      });
      // Record card transaction
      await tx.card_transactions.create({
        data: {
          card_id: card.id,
          card_type: 'insurance',
          transaction_type: 'top_up',
          reference: String(transaction.id),
          amount: amount,
          description: `Top-up from wallet ${wallet.id} to insurance card ${card.card_number}`,
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

const updateInsuranceCard = async (
  id: number,
  data: { status?: 'active' | 'suspended' }
): Promise<InsuranceCard> => {
  const existingCard = await InsuranceCardModel.findCardById(id);
  if (!existingCard) throw new NotFoundError('Insurance card not found');

  return await InsuranceCardModel.updateCard(id, data);
};

const transferToHealthCare = async (
  cardNumber: string,
  amount: number
): Promise<{ card: InsuranceCard; cardTransactionId: number }> => {
  if (amount <= 0) {
    throw new ValidationError('Amount must be positive');
  }

  const formattedCardNumber = formatInsuranceCardNumber(cardNumber);

  const card =
    await InsuranceCardModel.findCardByCardNumber(formattedCardNumber);

  if (!card) {
    throw new NotFoundError('Insurance card not found');
  }

  if (card.status === 'suspended')
    throw new ForbiddenError('This card is suspended');

  if (card.balance < amount) {
    throw new ValidationError('Insufficient insurance card balance');
  }

  const healthcareWallet =
    await WalletModel.findWalletByOrganizationType('Healthcare');
  if (!healthcareWallet) {
    throw new NotFoundError('Healthcare wallet not found');
  }

  return await prisma.$transaction(async (trx) => {
    // 1. Decrement insurance card balance
    const updatedCard = await InsuranceCardModel.updateCardBalance(
      card.id,
      amount,
      'decrement',
      trx
    );

    // 2. Increment healthcare wallet balance
    await WalletModel.WalletBalanceTopup(
      healthcareWallet.id,
      amount,
      'increment',
      trx
    );

    // 3. Record a transaction for the organization receiving the funds
    const walletTransactionId = await WalletModel.createTransaction(
      {
        wallet_id: healthcareWallet.id,
        transaction_type: 'transfer_in',
        amount: amount,
        target_service: 'healthcare',
        description: `Transfer from insurance card ${card.card_number}`,
      },
      trx
    );

    // 4. Create card transaction record for the insurance card that was charged
    // Note: Creating card_transaction directly here as there is no dedicated Model method for it yet
    // and it is consistent with MetroCardService implementation.
    console.log('do');
    const cardTransaction = await trx.card_transactions.create({
      data: {
        card_id: card.id,
        card_type: 'insurance',
        transaction_type: 'charge',
        reference: String(walletTransactionId),
        amount: amount,
        description: `Transfer to healthcare from insurance card ${card.card_number}`,
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
      cardTransactionId: cardTransaction.id,
    };
  });
};

const deleteCardById = async (id: number): Promise<void> => {
  const card = await InsuranceCardModel.findCardById(id);
  if (!card) throw new NotFoundError('Insurance card not found');
  await InsuranceCardModel.deleteCard(id);
};

export {
  getCardById,
  getCardByCardNumber,
  getCardByUserId,
  getCardsByUserId,
  createCard,
  topUpFromWallet,
  updateInsuranceCard,
  transferToHealthCare,
  deleteCardById,
};
