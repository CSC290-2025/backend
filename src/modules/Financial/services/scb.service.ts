import { randomUUID } from 'crypto';
import { ScbModel } from '../models';
import { ValidationError } from '@/errors';
import type {
  ScbToken,
  ScbQrRequestSchema,
  ScbQrResponseSchema,
  ScbQrCreateResponse,
} from '../types';

// the same as the one from model no business logic added
const getOAuthToken = async (): Promise<ScbToken> => {
  return await ScbModel.getOAuthToken();
};

const encrypt = async (data: object): Promise<string> => {
  const jsonString = JSON.stringify(data);
  const PUBLIC_KEY = process.env.G11_PUBLIC_KEY;
  if (!PUBLIC_KEY) {
    throw new ValidationError(
      'G11_PUBLIC_KEY environment variable is not defined'
    );
  }
  if (Object.keys(data).length === 0) {
    throw new ValidationError('Data to encrypt cannot be empty');
  }
  return await ScbModel.encryptData(jsonString, PUBLIC_KEY);
};

const decrypt = async (encryptedData: string): Promise<object> => {
  const PUBLIC_KEY = process.env.G11_PUBLIC_KEY;
  if (!PUBLIC_KEY) {
    throw new ValidationError(
      'G11_PUBLIC_KEY environment variable is not defined'
    );
  }
  if (!encryptedData) {
    throw new ValidationError('Encrypted data cannot be null or undefined');
  }
  const decryptedString = await ScbModel.decryptData(encryptedData, PUBLIC_KEY);
  return JSON.parse(decryptedString);
};

// validate env, generate refs
const createQrCode = async (
  qrRequestData: ScbQrRequestSchema,
  walletId: number
): Promise<ScbQrResponseSchema> => {
  const billerId = process.env.G11_BILLER_ID;
  const ref3Prefix = process.env.G11_REF3_PREFIX;

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

  const ref1 = ref('REF1');
  const ref2 = ref('REF2');
  const ref3 = ref(ref3Prefix);

  // Prepare request
  const qrRequest = {
    qrType: 'PP',
    ppType: 'BILLERID',
    ppId: billerId,
    amount: qrRequestData.amount,
    ref1,
    ref2,
    ref3,
  };

  // Create QR
  const qrResponse: ScbQrCreateResponse = await ScbModel.createQr(qrRequest);

  // Create wallet transaction
  await ScbModel.createWalletTransaction({
    wallet_id: walletId,
    transaction_type: 'top_up',
    amount: amount,
    target_service: 'wallet_top',
    description: `${ref1}`,
  });

  return {
    statusCode: qrResponse.status.code,
    description: qrResponse.status.description,
    qrRawData: qrResponse.data.qrRawData,
    user_id: qrRequestData.user_id,
    amount: qrRequestData.amount,
    ref1,
  };
};

const paymentConfirm = async (
  transactionId: string,
  sendingBank: string,
  reference1: string
) => {
  await ScbModel.updateTransactionDescription(
    reference1,
    transactionId,
    sendingBank
  );
  console.log('Payment confirmed successfully for ref1:', reference1);
};

const verifyPayment = async (ref1: string) => {
  const { transactionId, sendingBank, wallet } =
    await ScbModel.findTransactionForVerification(ref1);

  const data = await ScbModel.verifyPayment(transactionId, sendingBank);

  if (data.status.code === 1000) {
    console.log(
      'Payment verified successfully for ref1:',
      ref1,
      'amount:',
      data.data.amount
    );
    return {
      statusCode: data.status.code,
      description: data.status.description,
      amount: data.data.amount,
      userid: wallet.owner_id,
      ref1,
    };
  } else {
    throw new ValidationError(
      `Payment verification failed: ${data.status.code} - ${data.status.description}`
    );
  }
};

export {
  getOAuthToken,
  encrypt,
  decrypt,
  createQrCode,
  paymentConfirm,
  verifyPayment,
};
