import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  createApartmentData,
  updateApartmentData,
  ApartmentFilter,
} from '../types/apartment.types';
import { ApartmentSchemas } from '../schemas';

export async function getAllApartments() {
  try {
    const response = await prisma.apartment.findMany({
      include: {
        apartment_owner: {
          include: {
            users: true,
          },
        },
        addresses: true,
        rating: true,
        room: true,
      },
    });
    return response;
  } catch (error) {
    console.error('Prisma Find Error:', error);
    throw handlePrismaError(error);
  }
}

export async function getApartmentById(id: number) {
  try {
    const response = await prisma.apartment.findUnique({
      where: { id },
      include: {
        apartment_owner: {
          include: {
            users: true,
          },
        },
        addresses: true,
        rating: true,
        room: true,
      },
    });
    return response;
  } catch (error) {
    console.error('Prisma Find Error:', error);
    throw handlePrismaError(error);
  }
}

export async function createApartment(data: createApartmentData) {
  try {
    const { userId, ...apartmentData } = data;

    const response = await prisma.$transaction(async (tx) => {
      const apartment = await tx.apartment.create({
        data: {
          ...apartmentData,
          apartment_owner: {
            create: {
              user_id: userId,
            },
          },
        },
        include: {
          apartment_owner: true,
        },
      });
      return apartment;
    });
    return response;
  } catch (error) {
    console.error('Prisma Create Error:', error);
    throw handlePrismaError(error);
  }
}

export async function updateApartment(data: updateApartmentData, id: number) {
  try {
    const { ...updateData } = data;
    const response = await prisma.apartment.update({
      where: { id },
      data: updateData,
    });
    return response;
  } catch (error) {
    // 👇 Add this line for immediate debugging
    console.error('Original Error in updateApartment:', error);
    throw handlePrismaError(error);
  }
}

export async function deleteApartment(id: number) {
  try {
    // First delete associated records
    await prisma.$transaction([
      // Delete apartment_owner records
      prisma.apartment_owner.deleteMany({
        where: { apartment_id: id },
      }),
      // Delete rooms
      prisma.room.deleteMany({
        where: { apartment_id: id },
      }),
      // Delete apartment_picture records
      prisma.apartment_picture.deleteMany({
        where: { apartment_id: id },
      }),
      // Finally delete the apartment
      prisma.apartment.delete({
        where: { id },
      }),
    ]);
  } catch (error) {
    console.error('Prisma Delete Error:', error);
    throw handlePrismaError(error);
  }
}

export async function filterApartments(params: ApartmentFilter) {
  try {
    const validatedParams =
      ApartmentSchemas.ApartmentFilterSchema.parse(params);
    const filters: Record<string, unknown> = {};

    // 1. Filter by Location
    if (validatedParams.apartment_location) {
      filters.apartment_location = validatedParams.apartment_location;
    }

    // 2. Filter by Search (Name)
    if (validatedParams.search) {
      filters.name = { contains: validatedParams.search, mode: 'insensitive' };
    }

    // 3. Filter by Price Range
    if (validatedParams.minPrice || validatedParams.maxPrice) {
      filters.OR = [
        {
          room: {
            some: {
              AND: [
                validatedParams.minPrice
                  ? { price_start: { gte: validatedParams.minPrice } }
                  : {},
                validatedParams.maxPrice
                  ? { price_end: { lte: validatedParams.maxPrice } }
                  : {},
              ],
            },
          },
        },
      ];
    }

    const response = await prisma.apartment.findMany({
      where: filters,
      include: {
        apartment_owner: {
          include: {
            users: true,
          },
        },
        addresses: true,
        rating: true,
        room: true,
      },
    });
    return response;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function getApartmentRating(id: number) {
  try {
    const response = await prisma.apartment.findUnique({
      where: { id },
      select: { rating: true },
    });
    return response;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function countAvailableRooms(id: number) {
  try {
    const response = await prisma.room.count({
      where: {
        apartment_id: id,
        room_status: 'available',
      },
    });
    return response;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
