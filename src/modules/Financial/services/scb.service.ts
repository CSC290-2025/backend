import { randomUUID } from 'crypto';
import { ScbModel } from '../models';
import { WalletService } from '../services';
import { ValidationError } from '@/errors';
import type {
  ScbQrRequestSchema,
  ScbQrResponseSchema,
  ScbWebhookPayload,
  ScbApiQrRequest,
} from '../types';

// validate env, generate refs
const createQrCode = async (
  qrRequestData: ScbQrRequestSchema
): Promise<ScbQrResponseSchema> => {
  const billerId = process.env.G11_BILLER_ID;
  const ref3Prefix = process.env.G11_REF3_PREFIX;
  const payerId = qrRequestData.payerId;

  if (!payerId) {
    throw new ValidationError('Payer ID is required in the request body');
  }

  if (!billerId || billerId.length !== 15) {
    throw new ValidationError('G11_BILLER_ID must be 15 characters in .env');
  }

  if (!ref3Prefix) {
    throw new ValidationError('G11_REF3_PREFIX is required in .env');
  }

  if (ref3Prefix.length >= 20) {
    throw new ValidationError(
      'G11_REF3_PREFIX must be less than 20 characters'
    );
  }

  // Validate amount
  const amount = parseFloat(qrRequestData.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new ValidationError('Amount must be a positive number');
  }

  // generate ref numbers ( its max 20 chars including prefix)
  const ref = (p: string) =>
    p +
    randomUUID()
      .replace(/-/g, '')
      .toUpperCase()
      .slice(0, 20 - p.length);

  const ref1 = ref('R1'); // R1 will be the transaction reference for us
  const ref2 = payerId.toString(); // ref2 is the payerId itself for wallet lookup
  const ref3 = ref(ref3Prefix); // scb use this for their own tracking

  // Prepare request
  const qrRequest: ScbApiQrRequest = {
    qrType: 'PP',
    ppType: 'BILLERID',
    ppId: billerId,
    amount: qrRequestData.amount,
    ref1,
    ref2,
    ref3,
  };

  // Log for reference
  console.log('\nQR Code Created');
  console.log({
    ref1,
    ref2,
    ref3,
    amount: qrRequestData.amount,
  });

  return await ScbModel.createQr(qrRequest);
};

// Confirm QR payment with SCB
const confirmQrPayment = async (
  transRef: string | undefined,
  sendingBank: string | undefined
): Promise<object> => {
  // Validate required parameters
  if (!transRef || !sendingBank) {
    throw new ValidationError(
      'transRef and sendingBank are required parameters'
    );
  }

  return await ScbModel.confirmQrPayment(transRef, sendingBank);
};

// Process webhook from SCB
const processWebhook = async (payload: ScbWebhookPayload): Promise<void> => {
  // SCB sends data with these actual field names
  const data = payload as Record<string, unknown>;

  const transactionId = data.transactionId as string;
  const amount = data.amount as string;
  const ref1 = data.billPaymentRef1 as string;
  const ref2 = data.billPaymentRef2 as string;
  const ref3 = data.billPaymentRef3 as string;
  const sendingBankCode = data.sendingBankCode as string;

  console.log('Processing payment confirmation:');
  console.log('Transaction ID:', transactionId);
  console.log('Amount:', amount);
  console.log('Ref1:', ref1);
  console.log('Ref2:', ref2);
  console.log('Ref3:', ref3);
  console.log('Sending Bank Code:', sendingBankCode);

  if (transactionId && sendingBankCode) {
    try {
      const confirmation = await confirmQrPayment(
        transactionId,
        sendingBankCode
      );
      console.log('Payment confirmed:', confirmation);

      // Only top up if status code is 1000 (Success)
      const statusCode = (confirmation as { status?: { code?: number } })
        ?.status?.code;
      if (statusCode === 1000) {
        const userId = parseInt(ref2);

        if (!isNaN(userId)) {
          // Get user's wallet
          const wallets = await WalletService.getUserWallets(userId);
          const walletId = wallets[0].id;
          await WalletService.topUpBalance(walletId, parseFloat(amount));
          console.log(`Topped up wallet ${walletId} with ${amount}`);
        }
      } else {
        console.log(
          `Payment not successful. Status code: ${statusCode}. Skipping wallet top-up.`
        );
      }
    } catch (_error) {
      throw new Error('Failed to process webhook payment confirmation');
    }
  }
};

export { createQrCode, confirmQrPayment, processWebhook };
