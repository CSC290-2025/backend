import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@/generated/prisma';
import type { Address } from '../types';

const addressSelect = {
  id: true,
  address_line: true,
  province: true,
  district: true,
  subdistrict: true,
  postal_code: true,
} satisfies Prisma.addressesSelect;

type AddressRecord = Prisma.addressesGetPayload<{
  select: typeof addressSelect;
}>;

const mapAddress = (address: AddressRecord): Address => ({
  id: address.id,
  address_line: address.address_line ?? '',
  province: address.province ?? '',
  district: address.district ?? '',
  subdistrict: address.subdistrict ?? '',
  postal_code: address.postal_code ?? '',
});

const findAll = async (): Promise<Address[]> => {
  try {
    const addresses = await prisma.addresses.findMany({
      select: addressSelect,
      orderBy: { id: 'asc' },
    });

    return addresses.map(mapAddress);
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findAll };
