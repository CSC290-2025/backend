import { PrismaClient } from '@/generated/prisma';
import type { UserWithAddress, AddressG5 } from '../types/addressG5.types';

const prisma = new PrismaClient();

export const addressModel = {
  async getUsersByDistrict(district: string): Promise<UserWithAddress[]> {
    const users = await prisma.users.findMany({
      where: {
        user_profiles: {
          addresses: {
            district: {
              equals: district,
              mode: 'insensitive',
            },
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        user_profiles: {
          select: {
            addresses: {
              select: {
                id: true,
                address_line: true,
                province: true,
                district: true,
                subdistrict: true,
                postal_code: true,
              },
            },
          },
        },
      },
    });

    return users.map((user) => {
      const address = user.user_profiles?.addresses;

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        address: address
          ? {
              user_id: user.id,
              id: address.id,
              address_line: address.address_line,
              province: address.province,
              district: address.district,
              subdistrict: address.subdistrict,
              postal_code: address.postal_code,
            }
          : null,
      };
    });
  },
};
