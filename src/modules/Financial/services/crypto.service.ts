import { ValidationError } from '@/errors';
import { decrypt } from '../utils/crypto';
import type { DecryptData } from '../types/crypto.types';

const decryptText = async (data: DecryptData): Promise<string> => {
  try {
    return decrypt(data.encryptedText);
  } catch (error) {
    throw new ValidationError(
      'Failed to decrypt text. Invalid encrypted data.'
    );
  }
};

export { decryptText };
