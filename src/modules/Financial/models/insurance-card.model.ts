import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { insurance_cards } from '@/generated/prisma';
import type { InsuranceCard } from '../types';

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
const createCard = async (userId: number): Promise<InsuranceCard> => {
  try {
    const cardNumber = generateCardNumber(userId);

    const card = await prisma.insurance_cards.create({
      data: {
        user_id: userId,
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

const findCardsByUserId = async (userId: number): Promise<InsuranceCard[]> => {
  try {
    const cards = await prisma.insurance_cards.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return cards.map(transformInsuranceCard);
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

const findCardByCardNumber = async (
  cardNumber: string
): Promise<InsuranceCard | null> => {
  try {
    const card = await prisma.insurance_cards.findUnique({
      where: { card_number: cardNumber },
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

const updateCard = async (
  id: number,
  data: { status?: 'active' | 'suspended' }
): Promise<InsuranceCard> => {
  try {
    const card = await prisma.insurance_cards.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return transformInsuranceCard(card);
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  createCard,
  findCardByUserId,
  findCardsByUserId,
  findCardById,
  findCardByCardNumber,
  updateCardBalance,
  updateCard,
};
