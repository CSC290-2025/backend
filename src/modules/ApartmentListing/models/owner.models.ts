import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

export async function getOwnerRole() {
  try {
    const ownerRole = await prisma.users.findMany({
      where: {
        role_id: 23,
      },
    });
    return ownerRole;
  } catch (error) {
    console.error('Prisma Find Error:', error);
    throw handlePrismaError(error);
  }
}

export async function getApartmentOwnerByApartmentId(apartment_id: number) {
  try {
    const apartmentOwners = await prisma.apartment_owner.findMany({
      where: {
        apartment_id: apartment_id,
      },
      include: {
        users: true,
      },
    });
    return apartmentOwners;
  } catch (error) {
    console.error('Prisma Find Error:', error);
    throw handlePrismaError(error);
  }
}
