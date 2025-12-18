import { UserG1Model } from '../models';
import { UserModel } from '../models';
import { NotFoundError } from '@/errors';

const getUserAddress = async (user_id: number) => {
  const findUser = await UserModel.findUserById(user_id);
  if (!findUser) {
    throw new NotFoundError('User not found');
  }
  return await UserG1Model.getUserAddress(user_id);
};

export { getUserAddress };
