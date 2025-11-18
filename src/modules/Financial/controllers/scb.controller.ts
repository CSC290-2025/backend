import { ScbService } from '../services';
import { successResponse } from '@/utils/response';

import type { Context } from 'hono';
const createQrCode = async (c: Context) => {
  const body = await c.req.json();
  const qrResponse = await ScbService.createQrCode(body);
  return successResponse(
    c,
    { qrResponse },
    201,
    'QR code created successfully'
  );
};

export { createQrCode };
