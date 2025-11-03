import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  createAddressData,
  updateAddressData,
} from '../types/address.types';

export async function getAddressByID(id: number) {
  try {
    const address = await prisma.addresses.findUnique({
      where: { id },
    });
    return address;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function createAddress(data: createAddressData) {
  try {
    const address = await prisma.addresses.create({ data });
    return address;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function updateAddress(id: number, data: updateAddressData) {
  try {
    const room = await prisma.addresses.update({
      where: { id },
      data,
    });
    return room;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
export async function deleteAddress(id: number) {
  try {
    await prisma.addresses.delete({
      where: { id },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}
