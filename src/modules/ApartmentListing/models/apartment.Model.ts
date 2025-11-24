import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  createApartmentData,
  updateApartmentData,
  ApartmentFilter,
  Apartment,
} from '../types/apartment.types';
import { ApartmentSchemas } from '../schemas';
import type { apartment_location } from '@/generated/prisma';

// Helper function to transform apartment data from Prisma to expected format
function transformApartmentData(
  apartment: Record<string, unknown> | null
): Apartment | null {
  if (!apartment) return null;
  return {
    ...apartment,
    internet_price: apartment.internet_price
      ? Number(apartment.internet_price)
      : null,
  } as Apartment;
}

// Helper function to transform array of apartment data
function transformApartmentArray(
  apartments: Record<string, unknown>[]
): Apartment[] {
  return apartments
    .map(transformApartmentData)
    .filter((apt): apt is Apartment => apt !== null);
}

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
    return transformApartmentArray(response);
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
    return transformApartmentData(response);
  } catch (error) {
    console.error('Prisma Find Error:', error);
    throw handlePrismaError(error);
  }
}

export async function getApartmentByIdSimplified(id: number) {
  try {
    // Try fetching without includes first to isolate the issue
    const response = await prisma.apartment.findUnique({
      where: { id },
    });
    return transformApartmentData(response);
  } catch (error) {
    console.error('Prisma Find Error:', error);
    throw handlePrismaError(error);
  }
}

export async function getApartmentsByUser(userId: number) {
  try {
    const response = await prisma.apartment.findMany({
      where: {
        apartment_owner: {
          some: {
            user_id: userId,
          },
        },
      },
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
    return transformApartmentArray(response);
  } catch (error) {
    console.error('Prisma Find Error:', error);
    throw handlePrismaError(error);
  }
}
export async function createApartment(data: createApartmentData) {
  try {
    const { userId, address, ...apartmentData } = data;

    const response = await prisma.$transaction(
      async (tx) => {
        // Create address first
        const createdAddress = await tx.addresses.create({
          data: address,
        });

        // Build create payload and ensure apartment_location matches Prisma enum type
        const createData: Record<string, unknown> = {
          ...apartmentData,
          addresses: {
            connect: { id: createdAddress.id },
          },
          apartment_owner: {
            create: {
              user_id: userId,
            },
          },
        };

        if (createData.apartment_location) {
          // Cast to Prisma enum type
          createData.apartment_location =
            createData.apartment_location as apartment_location;
        }

        // Create apartment
        const apartment = await tx.apartment.create({
          data: createData,
          include: {
            apartment_owner: true,
            addresses: true,
          },
        });

        // Find and update user role
        const roleResult = await tx.roles.findFirst({
          where: {
            role_name: { contains: 'apartment', mode: 'insensitive' },
          },
        });

        if (roleResult) {
          await tx.users.update({
            where: {
              id: userId,
            },
            data: {
              role_id: roleResult.id,
            },
          });
        }

        return apartment;
      },
      {
        maxWait: 2000, // default: 2000
        timeout: 5000, // default: 5000
        isolationLevel: 'ReadCommitted', // optional, default: Serializable
      }
    );

    return transformApartmentData(response);
  } catch (error) {
    console.error('Prisma Create Error:', error);
    throw handlePrismaError(error);
  }
}

export async function updateApartment(data: updateApartmentData, id: number) {
  try {
    const { address, ...apartmentData } = data;

    const response = await prisma.$transaction(
      async (tx) => {
        const updateData: Record<string, unknown> = { ...apartmentData };

        // If address data is provided, update the address
        if (address) {
          // First get the apartment to find the address_id
          const apartment = await tx.apartment.findUnique({
            where: { id },
            select: { address_id: true },
          });

          if (!apartment) {
            throw new Error('Apartment not found');
          }

          if (apartment.address_id) {
            // Update existing address
            await tx.addresses.update({
              where: { id: apartment.address_id },
              data: address,
            });
          } else {
            // Create new address if apartment doesn't have one
            const newAddress = await tx.addresses.create({
              data: address,
            });
            updateData.address_id = newAddress.id;
          }
        }

        // Update the apartment
        const updatedApartment = await tx.apartment.update({
          where: { id },
          data: updateData,
          include: {
            addresses: true,
            apartment_owner: true,
          },
        });

        return updatedApartment;
      },
      {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: 'ReadCommitted',
      }
    );

    return transformApartmentData(response);
  } catch (error) {
    console.error('Update apartment error details:', error);
    throw handlePrismaError(error);
  }
}

export async function deleteApartment(id: number) {
  try {
    await prisma.$transaction(
      async (tx) => {
        // First, get the apartment to find its address_id
        const apartment = await tx.apartment.findUnique({
          where: { id },
          select: { address_id: true, apartment_owner: true },
        });

        // Delete apartment_owner records
        await tx.apartment_owner.deleteMany({
          where: { apartment_id: id },
        });

        // Delete rooms
        await tx.room.deleteMany({
          where: { apartment_id: id },
        });

        // Delete apartment_picture records
        await tx.apartment_picture.deleteMany({
          where: { apartment_id: id },
        });

        // Delete the apartment
        await tx.apartment.delete({
          where: { id },
        });

        // Delete the address if it exists and is not used by other apartments
        if (apartment?.address_id) {
          const otherApartmentsUsingAddress = await tx.apartment.count({
            where: { address_id: apartment.address_id },
          });
          // Only delete if no other apartments are using this address
          if (otherApartmentsUsingAddress === 0) {
            await tx.addresses.delete({
              where: { id: apartment.address_id },
            });
          }
        }

        // Revert user role to default role if no more apartments owned
        const apartmentCount = await tx.apartment_owner.count({
          where: { user_id: apartment?.apartment_owner?.[0]?.user_id },
        });
        if (apartmentCount === 0) {
          const defaultRole = await tx.roles.findFirst({
            where: { role_name: { contains: 'citizen', mode: 'insensitive' } },
          });
          if (defaultRole) {
            await tx.users.update({
              where: {
                id: apartment?.apartment_owner?.[0]?.user_id,
              },
              data: {
                role_id: defaultRole.id,
              },
            });
          }
        }
      },
      {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: 'ReadCommitted',
      }
    );
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
    return transformApartmentArray(response);
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

export async function getRoomPriceRange(apartmentId: number) {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        apartment_id: apartmentId,
      },
      select: {
        price_start: true,
        price_end: true,
      },
    });

    if (rooms.length === 0) {
      return {
        minPrice: null,
        maxPrice: null,
        roomCount: 0,
      };
    }

    // Filter out null values and get all prices
    const prices: number[] = [];

    rooms.forEach((room) => {
      if (room.price_start !== null) prices.push(room.price_start);
      if (room.price_end !== null) prices.push(room.price_end);
    });

    if (prices.length === 0) {
      return {
        minPrice: null,
        maxPrice: null,
        roomCount: rooms.length,
      };
    }

    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      roomCount: rooms.length,
    };
  } catch (error) {
    console.error('Error getting room price range:', error);
    throw handlePrismaError(error);
  }
}
