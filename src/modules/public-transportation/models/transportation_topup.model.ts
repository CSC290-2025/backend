import axios from 'axios';
import prisma from '@/config/client';
import { Decimal } from '@prisma/client/runtime/library';

const FINANCE_API_URL =
  'http://localhost:3000/metro-cards/transfer-to-transportation';

export const transferBalanceToCard = async (cardId: number, amount: number) => {
  if (amount <= 0) {
    throw new Error('Transfer amount must be greater than zero.');
  }

  const amountDecimal = new Decimal(amount);
  const card = await prisma.digital_cards.findUnique({
    where: { id: cardId },
    select: { id: true, balance: true, finance_card_number: true } as any,
  });

  if (!card || !card.finance_card_number) {
    throw new Error(
      'Top Up Failed: Local card is not linked to Finance system (missing finance_card_number).'
    );
  }
  try {
    const response = await axios.post(FINANCE_API_URL, {
      cardNumber: card.finance_card_number,
      amount: amount,
    });

    if (response.status !== 200 || !response.data.success) {
      const financeMessage =
        response.data.message || 'Finance transfer failed.';
      throw new Error(`Finance Service Error: ${financeMessage}`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.digital_cards.update({
        where: { id: cardId },
        data: {
          balance: { increment: amountDecimal },
        } as any,
      });
    });

    return {
      cardId,
      transferredAmount: amount,
      transferredCardNo: card.finance_card_number,
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Top Up Failed: ${errorMessage}`);
  }
};
