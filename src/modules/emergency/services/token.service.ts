import { ValidationError } from '@/errors';
import { FcmModel } from '@/modules/emergency/models';
import type { CreateTokenFcm, FcmResponse } from '@/modules/emergency/types';

export const storeTokenToDB = async (
  data: CreateTokenFcm
): Promise<FcmResponse> => {
  if (!data.tokens) {
    throw new ValidationError('Token is required');
  }

  const tokenExist = await FcmModel.checkFcmTokenExist(data.tokens);
  if (tokenExist) {
    throw new ValidationError('Token already exists');
  }

  return await FcmModel.createFcmToken(data);
};
