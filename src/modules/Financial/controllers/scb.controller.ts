import type { Context } from 'hono';
import { ScbService } from '../services';
import { successResponse } from '@/utils/response';

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

const confirmQrPayment = async (c: Context) => {
  const transRef = c.req.param('transRef');
  const sendingBank = c.req.query('sendingBank');
  const confirmation = await ScbService.confirmQrPayment(transRef, sendingBank);
  return successResponse(
    c,
    { confirmation },
    200,
    'Payment confirmed successfully'
  );
};

export { createQrCode, handleWebhook, confirmQrPayment };
