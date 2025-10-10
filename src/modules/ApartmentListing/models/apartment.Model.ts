import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { createApartmentData, updateApartmentData } from '../schemas';

export async function getAllApartments() {
  try {
    const response = await prisma.apartment.findMany();
    return response;
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function getApartmentById(id: string) {
  try {
    const response = await prisma.apartment.findUnique({
      where: { id },
    });
    return response;
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function createApartment(data: createApartmentData) {
  try {
    const response = await prisma.apartment.create({
      data,
    });
    return response;
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateApartment(data: updateApartmentData, id: string) {
  try {
    const response = await prisma.apartment.update({
      where: { id },
      data,
    });
    return response;
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteApartment(id: string) {
  try {
    await prisma.apartment.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function filterApartments(
  location?: string,
  minPrice?: number,
  maxPrice?: number,
  search?: string
) {
  try {
    const filters: any = {};
    if (location) filters.apartment_location = location;
    if (minPrice) filters.electric_price = { gte: minPrice };
    if (maxPrice) filters.electric_price = { lte: maxPrice };
    if (search) filters.description = { contains: search, mode: 'insensitive' };

    const response = await prisma.apartment.findMany({
      where: filters,
    });
    return response;
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function getApartmentRating(id: string) {
  try {
    const response = await prisma.apartment.findUnique({
      where: { id },
      select: { rating: true },
    });
    return response;
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function countAvailableRooms(id: string) {
  try {
    const response = await prisma.room.count({
      where: {
        apartment_id: Number(id),
        room_status: 'available',
      },
    });
    return response;
  } catch (error) {
    handlePrismaError(error);
  }
}
