import { addressModel } from '../models';
import { NotFoundError } from '@/errors';
import type { Address, createAddressData, updateAddressData } from '../types';

const getAddressByID = async (id: number): Promise<Address> => {
  const address = await addressModel.getAddressByID(id);
  if (!address) throw new NotFoundError('Address not found');
  return address;
};

const createAddress = async (data: createAddressData): Promise<Address> => {
  const address = await addressModel.createAddress(data);
  if (!address) throw new NotFoundError('Failed to create address');
  return address;
};

const updateAddress = async (
  data: updateAddressData,
  id: number
): Promise<Address> => {
  const existingAddress = await addressModel.getAddressByID(id);
  if (!existingAddress) throw new NotFoundError('Room not found');
  return addressModel.updateAddress(id, data);
};

const deleteAddress = async (id: number): Promise<void> => {
  const existingAddress = await addressModel.getAddressByID(id);
  if (!existingAddress) throw new NotFoundError('Room not found');
  await addressModel.deleteAddress(id);
};

export { getAddressByID, createAddress, updateAddress, deleteAddress };
