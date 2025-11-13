import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { RequiredAddress } from '../types/address.type';

const findAddressId = async (data: RequiredAddress) => {
  try {
    console.log('find', data);

    const address = await prisma.addresses.findFirst({
      where: {
        address_line: data.address_line,
        province: data.province,
        district: data.district,
        subdistrict: data.subDistrict,
        postal_code: data.postal_code,
      },
      select: {
        id: true,
      },
    });
    return address;
  } catch (error) {
    handlePrismaError(error);
  }
};

const createAddress = async (data: RequiredAddress) => {
  try {
    console.log('create', data);

    const address = await prisma.addresses.create({
      data: {
        address_line: data.address_line,
        province: data.province,
        district: data.district,
        subdistrict: data.subDistrict,
        postal_code: data.postal_code,
      },
    });
    return address;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findAddressId, createAddress };
