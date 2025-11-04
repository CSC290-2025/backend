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

const handleWebhook = async (c: Context) => {
  const payload = await c.req.json();

  // Log the received payload
  console.log('\n=== SCB Webhook Received ===');
  console.log(JSON.stringify(payload, null, 2));
  console.log('===========================\n');

  // Process the webhook
  await ScbService.processWebhook(payload);

  return successResponse(
    c,
    { received: true },
    200,
    'Webhook processed successfully'
  );
};

export { createQrCode, handleWebhook };
