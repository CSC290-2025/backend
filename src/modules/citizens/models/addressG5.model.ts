// import { PrismaClient } from "@/generated/prisma";

// const prisma = new PrismaClient();

// export const addressModel = {
//   async getUsersByDistrict(district: string) {
//     const users = await prisma.user_profiles.findMany({
//       where: {
//         addresses: {
//           district: {
//             equals: district,
//             mode: 'insensitive', // Case-insensitive search
//           },
//         },
//       },
//       select: {
//         more_address_detail: true,
//         addresses: {
//           select: {
//             id: true,
//             address_line: true,
//             province: true,
//             district: true,
//             subdistrict: true,
//             postal_code: true,
//           },
//         },
//       },
//     });

//     return users;
//   },
// };

import { PrismaClient } from '@/generated/prisma';
import type { UserWithAddress } from '../types/addressG5.types';
const prisma = new PrismaClient();
export const addressModel = {
  async getUsersByDistrict(district: string): Promise<UserWithAddress[]> {
    return prisma.users
      .findMany({
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
      })
      .then((users) =>
        users.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          address: u.user_profiles?.addresses ?? null,
        }))
      );
  },
};
