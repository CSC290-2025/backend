import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { insurance_cards } from '@/generated/prisma';
import type { InsuranceCard, CreateInsuranceCardData } from '../types';

// Helper to transform Prisma model to app type
const transformInsuranceCard = (card: insurance_cards): InsuranceCard => ({
  ...card,
  user_id: card.user_id!,
  card_number: card.card_number!,
  balance: Number(card.balance || 0),
  status: card.status as 'active' | 'suspended',
});

// Generate unique card number based on user_id
const generateCardNumber = (userId: number): string => {
  const timestamp = Date.now().toString().slice(-6);
  const userPadded = userId.toString().padStart(6, '0');
  return `INS-${userPadded}-${timestamp}`;
};

// Insurance card operations
const createCard = async (
  data: CreateInsuranceCardData
): Promise<InsuranceCard> => {
  try {
    const cardNumber = generateCardNumber(data.user_id);

    const card = await prisma.insurance_cards.create({
      data: {
        user_id: data.user_id,
        card_number: cardNumber,
        balance: 0,
        status: 'active',
      },
    });
    return transformInsuranceCard(card);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findCardByUserId = async (
  userId: number
): Promise<InsuranceCard | null> => {
  try {
    const card = await prisma.insurance_cards.findFirst({
      where: { user_id: userId },
    });
    return card ? transformInsuranceCard(card) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findCardById = async (id: number): Promise<InsuranceCard | null> => {
  try {
    const card = await prisma.insurance_cards.findUnique({
      where: { id },
    });
    return card ? transformInsuranceCard(card) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateCardBalance = async (
  id: number,
  balance: number
): Promise<InsuranceCard> => {
  try {
    const card = await prisma.insurance_cards.update({
      where: { id },
      data: {
        balance,
        updated_at: new Date(),
      },
    });
    return transformInsuranceCard(card);
  } catch (error) {
    handlePrismaError(error);
  }
};

export { createCard, findCardByUserId, findCardById, updateCardBalance };
