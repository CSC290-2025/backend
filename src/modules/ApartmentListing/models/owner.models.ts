import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

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
