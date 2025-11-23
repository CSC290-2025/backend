import { NotFoundError } from '@/errors';
import { apartmentModel, ownerModel } from '../models';

const getApartmentOwnerByApartmentId = async (apartment_id: number) => {
  const existingApartment = await apartmentModel.getApartmentById(apartment_id);
  if (!existingApartment) throw new NotFoundError('Apartment not found');
  const owners = await ownerModel.getApartmentOwnerByApartmentId(apartment_id);
  return owners;
};

export { getApartmentOwnerByApartmentId };
