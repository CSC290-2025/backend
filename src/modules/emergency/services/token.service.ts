import { ValidationError } from '@/errors';
import { FcmModel } from '@/modules/emergency/models';
import type {
  CreateTokenFcm,
  TokenFcmResponse,
} from '@/modules/emergency/types/token.type.ts';

export const storeTokenToDB = async (
  data: CreateTokenFcm
): Promise<TokenFcmResponse> => {
  if (!data.tokens) {
    throw new ValidationError('Token is required');
  }

  const tokenExist = await FcmModel.checkFcmTokenExist(data.tokens);
  if (tokenExist) {
    throw new ValidationError('Token already exists');
  }

  return await FcmModel.createFcmToken(data);
};

export const getTokenByUserId = async (
  userId: number
): Promise<TokenFcmResponse | null> => {
  if (!userId) {
    throw new ValidationError('UserId is required');
  }
  return await FcmModel.getFcmTokenByUserId(userId);
};
