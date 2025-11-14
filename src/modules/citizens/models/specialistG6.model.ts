import { PrismaClient } from '@/generated/prisma';
import type { UserSpecialistResponse } from '../types/specialistG6.type';

const prisma = new PrismaClient();
export const userSpecialistModel = {
  async getUserSpecialists(userId: number): Promise<UserSpecialistResponse> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        users_specialty: {
          include: {
            specialty: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const specialists = user.users_specialty.map((us) => ({
      id: us.specialty.id,
      specialty_name: us.specialty.specialty_name,
    }));

    return {
      userId: user.id,
      specialists,
    };
  },
};
