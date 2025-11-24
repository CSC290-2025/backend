import prisma from '@/config/client';
import { Decimal } from '@prisma/client/runtime/library';
import axios from 'axios';

const INITIAL_BALANCE = 0;
const FINANCE_CREATE_CARD_URL = 'http://localhost:3000/metro-cards';
export const createDigitalCard = async (
  userId: number,
  financeCardNumber: string
) => {
  try {
    const initialBalanceDecimal = new Decimal(INITIAL_BALANCE);

    const existingCard = await prisma.digital_cards.findFirst({
      where: { finance_card_number: financeCardNumber },
    });
    if (existingCard) {
      throw new Error('This finance card number is already registered.');
    }
    const financeResponse = await axios.post(FINANCE_CREATE_CARD_URL, {
      user_id: userId,
      card_no: financeCardNumber,
    });

    const newCard = await prisma.digital_cards.create({
      data: {
        user_id: userId,
        status: 'active',
        balance: initialBalanceDecimal,
        finance_card_number: financeCardNumber,
      } as any,
    });

    return newCard;
  } catch (error) {
    const errorMessage =
      (error as any).response?.data?.message || (error as Error).message;

    console.error('Error creating digital card:', errorMessage);
    throw new Error(
      `Failed to create new digital card. Details: ${errorMessage}`
    );
  }
};

export const getUserDigitalCards = async (userId: number) => {
  try {
    const cards = await prisma.digital_cards.findMany({
      where: { user_id: userId },
      orderBy: { id: 'asc' },
    });
    return cards;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to retrieve user cards: ${(error as any).message}`);
  }
};
