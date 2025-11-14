import { UserSpecialtyG1Model } from '../models';
import { UserModel } from '../models';
import { SpecialtyModel } from '../models';
import type { CreateUserSpecialty } from '../types';
import { NotFoundError, ValidationError } from '@/errors';

const createUserSpecialty = async (data: CreateUserSpecialty) => {
  const findUser = await UserModel.findUserById(data.user_id);
  if (!findUser) {
    throw new NotFoundError('User not found');
  }
  const findSpecialty = await SpecialtyModel.findSpecialtyById(
    data.specialty_id
  );
  if (!findSpecialty) {
    throw new NotFoundError('Specialty not found');
  }
  return await UserSpecialtyG1Model.createUserSpecialty(data);
};

export { createUserSpecialty };
