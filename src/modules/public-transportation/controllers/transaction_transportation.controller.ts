import { successResponse, errorResponse } from '@/utils/response';
import { handleTapTransaction } from '../models/transaction_transportation.model';
import type { Context } from 'hono';

const handleTap = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { cardId, location, vehicleType } = body;

    if (!cardId || !location || !vehicleType) {
      return errorResponse(
        c,
        'Missing required fields: cardId, location, vehicleType',
        400
      );
    }

    const result = await handleTapTransaction(
      Number(cardId),
      location,
      vehicleType.toUpperCase()
    );

    if (result.type === 'TAP_IN') {
      return successResponse(
        c,
        result,
        200,
        `Tap IN successful. Max fare reserved: ${result.maxFareReserved} THB`
      );
    } else {
      return successResponse(
        c,
        result,
        200,
        `Tap OUT successful. Charged: ${result.charged} THB`
      );
    }
  } catch (error: any) {
    console.error('Tap transaction failed:', error.message);
    return errorResponse(c, error.message, 400);
  }
};

export { handleTap };
