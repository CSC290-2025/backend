import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  createBookingData,
  updateBookingData,
} from '../types/booking.types';

//for admin to see all bookings
export async function getAllBookings() {
  try {
    const bookings = await prisma.apartment_booking.findMany({
      include: {
        users: true,
        room: {
          include: {
            apartment: true,
          },
        },
      },
    });
    return bookings;
  } catch (error) {
    console.error('Prisma Find Error:', error);
    throw handlePrismaError(error);
  }
}

//see booking details by apartment id
export async function getBookingsByApartmentId(apartmentId: number) {
  try {
    const bookings = await prisma.apartment_booking.findMany({
      where: {
        room: {
          apartment_id: apartmentId,
        },
      },
      include: {
        users: true,
        room: {
          include: {
            apartment: true,
          },
        },
      },
    });
    return bookings;
  } catch (error) {
    console.error('Prisma Find Error:', error);
    throw handlePrismaError(error);
  }
}
//just in case to get booking by id
export async function getBookingById(id: number) {
  try {
    const booking = await prisma.apartment_booking.findUnique({
      where: {
        id,
      },
      include: {
        users: true,
        room: {
          include: {
            apartment: true,
          },
        },
      },
    });
    return booking;
  } catch (error) {
    console.error('Prisma Find Error:', error);
    throw handlePrismaError(error);
  }
}

export async function createBooking(data: createBookingData) {
  try {
    const newBooking = await prisma.apartment_booking.create({
      data: {
        ...data,
      },
    });
    return newBooking;
  } catch (error) {
    console.error('Prisma Create Error:', error);
    throw handlePrismaError(error);
  }
}

export async function updateBooking(id: number, data: updateBookingData) {
  try {
    const updatedBooking = await prisma.apartment_booking.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
    return updatedBooking;
  } catch (error) {
    console.error('Prisma Update Error:', error);
    throw handlePrismaError(error);
  }
}

export async function deleteBooking(id: number) {
  try {
    const deletedBooking = await prisma.apartment_booking.delete({
      where: {
        id,
      },
    });
    await prisma.room.update({
      where: {
        id: deletedBooking.room_id,
      },
      data: {
        room_status: 'available',
      },
    });

    return deletedBooking;
  } catch (error) {
    console.error('Prisma Delete Error:', error);
    throw handlePrismaError(error);
  }
}
