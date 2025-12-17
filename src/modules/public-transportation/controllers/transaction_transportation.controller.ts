import { successResponse, errorResponse } from '@/utils/response';
import {
  getTransportationHistory,
  handleTapTransaction,
} from '../models/transaction_transportation.model';
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
const getHistory = async (c: Context) => {
  try {
    const cardIdQuery = c.req.query('cardId');
    const limit = 6;

    // 💡 การแก้ไข: ใช้ parseInt() แทน Number() เพื่อบังคับให้เป็น Integer
    const numericCardId = cardIdQuery ? parseInt(cardIdQuery, 10) : null;

    if (!numericCardId || isNaN(numericCardId)) {
      console.error(`Received invalid cardId query: ${cardIdQuery}`);
      return errorResponse(
        c,
        'Missing or invalid cardId in query parameter. Cannot retrieve history.',
        400
      );
    }

    const history = await getTransportationHistory(numericCardId, limit);

    // 💡 NEW LOG: ตรวจสอบความยาวของ Array ทันทีใน Controller
    console.log(
      `[Controller Debug] History Array Length received from Model: ${history.length}`
    );

    // 🛑 การแก้ไข Response: ยืนยันว่าส่ง Array ภายใต้ Key 'data'
    return successResponse(
      c,
      { data: history }, // โครงสร้าง { data: Array }
      200,
      `Successfully retrieved ${history.length} transportation transactions.`
    );
  } catch (error: any) {
    console.error('History retrieval failed:', error.message);
    return errorResponse(c, error.message, 500);
  }
};

export { handleTap, getHistory };
