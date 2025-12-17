import { successResponse, errorResponse } from '@/utils/response';
import { handleTapTransaction } from '../models/transaction_transportation.model';
import type { Context } from 'hono';

const handleTap = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { cardId, location, vehicleType } = body;

    const numericCardId = Number(cardId);

    if (!numericCardId || isNaN(numericCardId) || !location || !vehicleType) {
      return errorResponse(
        c,
        'Missing required fields: cardId (number), location, vehicleType',
        400
      );
    }

    const result = await handleTapTransaction(
      numericCardId,
      location,
      vehicleType.toUpperCase()
    );

    if (result.type === 'TAP_IN') {
      return successResponse(
        c,
        result,
        200,
        `Tap IN successful. Max fare reserved: ${(result as any).maxFareReserved} THB`
      );
    } else {
      return successResponse(
        c,
        result,
        200,
        `Tap OUT successful. Charged: ${(result as any).charged} THB`
      );
    }
  } catch (error: any) {
    console.error('Tap transaction failed:', error.message);
    return errorResponse(c, error.message, 400);
  }
};

export { handleTap };
