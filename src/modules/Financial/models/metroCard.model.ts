import prisma from '@/config/client';
import type { metro_cards } from '@/generated/prisma';
import type { CreateMetroCardData, MetroCard } from '../types';
import { customAlphabet } from 'nanoid';
import { handlePrismaError } from '@/errors';

//Helper
export const generateMetroCard = (prefix = '01') => {
  const nanoid = customAlphabet('0123456789', 11);

  const luhnCheckDigit = (num: string) => {
    const arr = num.split('').reverse().map(Number);
    const sum = arr.reduce(
      (acc, n, i) => acc + (i % 2 ? (n * 2 > 9 ? n * 2 - 9 : n * 2) : n),
      0
    );
    return (10 - (sum % 10)) % 10;
  };

  const base = prefix + nanoid();
  const check = luhnCheckDigit(base);
  return base + check;
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
        card_number: generateMetroCard(),
        balance: 0,
      },
    });
    return transformMetroCard(metroCard);
  } catch (error) {
    handlePrismaError(error);
  }
};

export { createMetroCard };
