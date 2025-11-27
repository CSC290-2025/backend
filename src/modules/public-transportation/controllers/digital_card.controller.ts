import { successResponse, errorResponse } from '@/utils/response';
import { createDigitalCard } from '../models/digital_card.model';
import type { Context } from 'hono';

const handleCreateDigitalCard = async (c: Context) => {
  try {
    const body = await c.req.json();
    const userId = Number(body.userId);
    const financeCardNumber = body.financeCardNumber;

    if (
      !userId ||
      !financeCardNumber ||
      typeof financeCardNumber !== 'string'
    ) {
      return errorResponse(
        c,
        'Missing required fields: userId and financeCardNumber (string)',
        400
      );
    }

    const newCard = await createDigitalCard(userId, financeCardNumber);

    return successResponse(
      c,
      { card: newCard },
      201,
      'Digital card created successfully.'
    );
  } catch (error: any) {
    console.error('Error in card creation:', error.message);
    return errorResponse(c, error.message, 500);
  }
};

export { handleCreateDigitalCard };
