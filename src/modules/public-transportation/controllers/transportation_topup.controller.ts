import { successResponse, errorResponse } from '@/utils/response';
import { transferBalanceToCard } from '../models/transportation_topup.model';
import type { Context } from 'hono';

export const handleTopUp = async (c: Context) => {
  try {
    const body = await c.req.json();
    const cardId = Number(body.cardId);
    const amount = Number(body.amount);

    if (!cardId || isNaN(amount) || amount <= 0) {
      return errorResponse(c, 'Invalid Card ID or amount specified.', 400);
    }
    const result = await transferBalanceToCard(cardId, amount);

    return successResponse(c, result, 200, 'Balance topped up successfully.');
  } catch (error: any) {
    console.error('Top Up transaction failed:', error.message);
    return errorResponse(c, error.message, 400);
  }
};
