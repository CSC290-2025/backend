import { NotFoundError } from '@/errors';
import { apartmentModel, ownerModel } from '../models';
import { AuthModel } from '@/modules/Auth/models';

const getApartmentOwnerByApartmentId = async (apartment_id: number) => {
  const existingApartment = await apartmentModel.getApartmentById(apartment_id);
  if (!existingApartment) throw new NotFoundError('Apartment not found');
  const owners = await ownerModel.getApartmentOwnerByApartmentId(apartment_id);
  return owners;
};

const getUserById = async (userId: number) => {
  const user = await AuthModel.findUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  return user;
};

export { getApartmentOwnerByApartmentId, getUserById };
