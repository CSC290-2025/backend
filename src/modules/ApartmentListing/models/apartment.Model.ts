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
import { insertLatLong } from './locationIQ.model';

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

    const result = await prisma.$transaction(
      async (tx) => {
        const createdAddress = await tx.addresses.create({
          data: address,
        });

        // Build apartment data
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

        // Update user role
        const roleResult = await tx.roles.findFirst({
          where: {
            role_name: { contains: 'apartment', mode: 'insensitive' },
          },
        });

        if (roleResult) {
          await tx.users.update({
            where: { id: userId },
            data: { role_id: roleResult.id },
          });
        }

        return { apartment, addressId: createdAddress.id, address };
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );
    insertLatLong(
      result.addressId,
      result.address.address_line || '',
      result.address.province || '',
      result.address.district || '',
      result.address.subdistrict || '',
      result.address.postal_code || ''
    ).catch((error) => {
      console.error('Failed to insert lat/long:', error);
    });

    return transformApartmentData(result.apartment);
  } catch (error) {
    console.error('Prisma Create Error:', error);
    throw handlePrismaError(error);
  }
}

export async function updateApartment(data: updateApartmentData, id: number) {
  try {
    const { address, ...apartmentData } = data;
    let addressData: typeof address | undefined;

    const result = await prisma.$transaction(
      async (tx) => {
        const updateData: Record<string, unknown> = { ...apartmentData };

        if (address) {
          const currentApartment = await tx.apartment.findUnique({
            where: { id },
            select: { address_id: true },
          });

          if (!currentApartment) {
            throw new Error('Apartment not found');
          }

          if (currentApartment.address_id) {
            await tx.addresses.update({
              where: { id: currentApartment.address_id },
              data: address,
            });
            addressData = address;
          } else {
            const newAddress = await tx.addresses.create({
              data: address,
            });
            addressData = address;
            updateData.address_id = newAddress.id;
          }
        }

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
        maxWait: 10000,
        timeout: 30000,
      }
    );

    if (address && result.address_id) {
      insertLatLong(
        result.address_id,
        address.address_line || '',
        address.province || '',
        address.district || '',
        address.subdistrict || '',
        address.postal_code || ''
      ).catch((error) => {
        console.error('Failed to update lat/long:', error);
      });
    }

    return transformApartmentData(result);
  } catch (error) {
    console.error('Update apartment error details:', error);
    throw handlePrismaError(error);
  }
}

export async function deleteApartment(id: number) {
  try {
    await prisma.$transaction(
      async (tx) => {
        // Fetch apartment with only needed data
        const apartment = await tx.apartment.findUnique({
          where: { id },
          select: {
            address_id: true,
            apartment_owner: {
              select: { user_id: true },
              take: 1,
            },
          },
        });

        if (!apartment) {
          throw new Error('Apartment not found');
        }

        const userId = apartment.apartment_owner?.[0]?.user_id;

        // Step 1: Delete apartment_picture (no dependencies)
        await tx.apartment_picture.deleteMany({
          where: { apartment_id: id },
        });

        // Step 2: Delete apartment_booking (references room via fk_room_id)
        await tx.apartment_booking.deleteMany({
          where: { apartment_id: id },
        });

        // Step 3: Delete apartment_owner
        await tx.apartment_owner.deleteMany({
          where: { apartment_id: id },
        });

        // Step 4: Delete rooms (must be after apartment_booking)
        await tx.room.deleteMany({
          where: { apartment_id: id },
        });

        // Step 5: Delete apartment
        await tx.apartment.delete({
          where: { id },
        });

        // Step 6: Check and delete orphaned address
        if (apartment.address_id) {
          const addressInUse = await tx.apartment.findFirst({
            where: { address_id: apartment.address_id },
            select: { id: true },
          });

          if (!addressInUse) {
            await tx.addresses.deleteMany({
              where: { id: apartment.address_id },
            });
          }
        }

        // Step 7: Revert user role if no apartments remain
        if (userId) {
          const remainingApartments = await tx.apartment_owner.findFirst({
            where: { user_id: userId },
            select: { apartment_id: true },
          });

          if (!remainingApartments) {
            const defaultRole = await tx.roles.findFirst({
              where: {
                role_name: { contains: 'citizen', mode: 'insensitive' },
              },
              select: { id: true },
            });

            if (defaultRole) {
              await tx.users.updateMany({
                where: { id: userId },
                data: { role_id: defaultRole.id },
              });
            }
          }
        }
      },
      {
        maxWait: 10000,
        timeout: 30000,
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
