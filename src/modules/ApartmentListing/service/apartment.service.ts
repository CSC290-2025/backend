import { apartmentModel } from '../models';
import { NotFoundError, ValidationError } from '@/errors';
import type {
  Apartment,
  createApartmentData,
  updateApartmentData,
} from '../types';

const getApartmentByID = async (id: number): Promise<Apartment> => {
  const apartment = await apartmentModel.getApartmentById(id);
  if (!apartment) throw new NotFoundError('Apartment not found');
  return apartment;
};

const getAllApartments = async (): Promise<Apartment[]> => {
  const apartments = await apartmentModel.getAllApartments();
  if (!apartments) throw new NotFoundError('No apartments found');
  return apartments;
};

const createApartment = async (
  data: createApartmentData
): Promise<Apartment> => {
  if (
    !data.name ||
    !data.apartment_location ||
    !data.electric_price ||
    !data.water_price
  ) {
    throw new ValidationError('Missing required fields');
  }

  const apartment = await apartmentModel.createApartment(data);
  if (!apartment) throw new Error('Failed to create apartment');
  return apartment;
};

const updateApartment = async (
  data: updateApartmentData,
  id: number
): Promise<Apartment> => {
  const existingApartment = await apartmentModel.getApartmentById(id);
  if (!existingApartment) throw new NotFoundError('Apartment not found');

  const updatedApartment = await apartmentModel.updateApartment(data, id);
  if (!updatedApartment) throw new Error('Failed to update apartment');
  return updatedApartment;
};
const deleteApartment = async (id: number): Promise<void> => {
  const existingApartment = await apartmentModel.getApartmentById(id);
  if (!existingApartment) throw new NotFoundError('Apartment not found');
  await apartmentModel.deleteApartment(id);
};

const getApartmentRating = async (apartmentId: number) => {
  const apartment = await getApartmentByID(apartmentId);
  if (!apartment) throw new NotFoundError('Apartment not found');

  const rating = await apartmentModel.getApartmentRating(apartmentId);
  return rating;
};

const filterApartments = async (
  location: string | null = null,
  minPrice: number | null = null,
  maxPrice: number | null = null,
  search: string | null = null
) => {
  const apartments = await apartmentModel.filterApartments({
    apartment_location: location,
    minPrice,
    maxPrice,
    search,
  });
  if (!apartments) throw new NotFoundError('No apartments found');
  return apartments;
};

const countAvailableRooms = async (apartmentId: number): Promise<number> => {
  const existingApartment = await apartmentModel.getApartmentById(apartmentId);
  if (!existingApartment) throw new NotFoundError('Apartment not found');
  return apartmentModel.countAvailableRooms(apartmentId);
};

export {
  getApartmentByID,
  getAllApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  getApartmentRating,
  countAvailableRooms,
  filterApartments,
};
