import prisma from '@/config/client';
import type { metro_cards } from '@/generated/prisma';
import type { MetroCard, UpdateMetroCardData } from '../types';
import { customAlphabet } from 'nanoid';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@prisma/client/scripts/default-index';

//Helper
export const generateMetroCard = (user_id: number) => {
  const nanoid = customAlphabet('0123456789', 11);

  const prefix = user_id.toString().padStart(4, '0');

  const base = prefix + nanoid();

  return 'MET-' + base;
};

const transformMetroCard = (metroCard: metro_cards): MetroCard => ({
  ...metroCard,
  user_id: metroCard.user_id!,
  balance: Number(metroCard.balance || 0),
  card_number: metroCard.card_number!,
  status: metroCard.status as 'active' | 'suspended',
});

// MetroCard operations
const createMetroCard = async (user_id: number): Promise<MetroCard> => {
  try {
    const metroCard = await prisma.metro_cards.create({
      data: {
        user_id: user_id,
        card_number: generateMetroCard(user_id),
        balance: 0,
      },
    });
    return transformMetroCard(metroCard);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMetroCardsByUserId = async (userId: number): Promise<MetroCard[]> => {
  try {
    const metroCards = await prisma.metro_cards.findMany({
      where: { user_id: userId },
    });
    return metroCards.map(transformMetroCard);
  } catch (error) {
    handlePrismaError(error);
  }
};

const findMetroCardById = async (id: number): Promise<MetroCard | null> => {
  try {
    const metroCard = await prisma.metro_cards.findUnique({
      where: { id },
    });
    return metroCard ? transformMetroCard(metroCard) : null;
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateMetroCard = async (
  id: number,
  data: UpdateMetroCardData
): Promise<MetroCard> => {
  try {
    const metroCard = await prisma.metro_cards.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return transformMetroCard(metroCard);
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateMetroCardBalance = async (
  id: number,
  balance: number,
  type: 'increment' | 'decrement',
  trx: Prisma.TransactionClient
): Promise<MetroCard> => {
  try {
    const metroCard = await trx.metro_cards.update({
      where: { id },
      data: {
        balance: {
          [type]: balance,
        },
        updated_at: new Date(),
      },
    });

    return transformMetroCard(metroCard);
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  createMetroCard,
  findMetroCardsByUserId,
  findMetroCardById,
  updateMetroCard,
  updateMetroCardBalance,
};
