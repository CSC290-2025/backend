import { UserG8Model } from '../models';
import { UserModel } from '../models';
import { NotFoundError, ValidationError } from '@/errors';

const getUserinfoAndWallet = async (user_id: number) => {
  const findUser = await UserModel.findUserById(user_id);
  if (!findUser) {
    throw new NotFoundError('User not found');
  }
  return await UserG8Model.getUserinfoAndWallet(user_id);
};

export { getUserinfoAndWallet };
