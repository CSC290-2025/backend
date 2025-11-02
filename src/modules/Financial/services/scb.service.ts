import { ScbModel } from '../models';
import { ValidationError } from '@/errors';
import type {
  ScbToken,
  ScbQrRequestSchema,
  ScbQrResponseSchema,
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
  if (!data) {
    throw new ValidationError('Data to encrypt cannot be null or undefined');
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

const createQrCode = async (
  qrRequestData: ScbQrRequestSchema
): Promise<ScbQrResponseSchema> => {
  // Validate required fields
  if (!qrRequestData.qrType) {
    throw new ValidationError('QR type is required');
  }
  if (!qrRequestData.ppType) {
    throw new ValidationError('BILLERID type is required');
  }
  if (qrRequestData.ppType === 'BILLERID' && !qrRequestData.ppId) {
    throw new ValidationError('PromptPay ID is required for BILLERID');
  }
  if (qrRequestData.ppType === 'BILLERID' && !qrRequestData.ref1) {
    throw new ValidationError('Reference 1 is required for BILLERID');
  }
  if (!qrRequestData.ref2) {
    throw new ValidationError('Reference 2 is required for this merchant');
  }
  if (qrRequestData.ppId.length !== 15) {
    throw new ValidationError('PromptPay ID must be 15 characters long');
  }

  return await ScbModel.createQr(qrRequestData);
};

export { getOAuthToken, encrypt, decrypt, createQrCode };
