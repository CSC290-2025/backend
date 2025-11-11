import { ScbModel } from '../models';
import { ValidationError } from '@/errors';
import type { ScbToken } from '../types';

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

export { getOAuthToken, encrypt, decrypt };
