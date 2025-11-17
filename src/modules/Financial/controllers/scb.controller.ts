import { ScbService } from '../services';
import { successResponse } from '@/utils/response';
import { WalletModel } from '../models';
import { NotFoundError, ValidationError } from '@/errors';

import type { Context } from 'hono';
const createQrCode = async (c: Context) => {
  const body = await c.req.json();
  const { user_id: userId } = body;

  const wallet = await WalletModel.findWalletByUserId(userId);
  if (!wallet) {
    throw new NotFoundError('Wallet not found');
  }

  const qrResponse = await ScbService.createQrCode(body, wallet.id);
  return successResponse(
    c,
    { qrResponse },
    201,
    'QR code created successfully'
  );
};

const paymentConfirm = async (c: Context) => {
  const body = await c.req.json();
  const {
    transactionId,
    sendingBankCode: sendingBank,
    billPaymentRef1: reference1,
  } = body;

  if (!transactionId || !sendingBank) {
    throw new ValidationError('transactionId and sendingBank are required');
  }

  await ScbService.paymentConfirm(transactionId, sendingBank, reference1);
  return successResponse(c, { status: 'success' }, 200, 'Payment confirmed');
};

const verifyPayment = async (c: Context) => {
  const { ref1 } = c.req.query();
  if (!ref1) {
    throw new ValidationError('ref1 is required');
  }

  const result = await ScbService.verifyPayment(ref1);
  return successResponse(c, result, 200, 'Payment verified');
};

export { createQrCode, paymentConfirm, verifyPayment };
