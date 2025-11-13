import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type {
  createBookingData,
  updateBookingData,
} from '../types/booking.types';

//for user to see all bookings
export async function getAllBookingsForUser(userId: number) {
  try {
    const bookings = await prisma.apartment_booking.findMany({
      where: {
        user_id: userId,
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

    // Transform the data to match the schema
    return bookings.map((booking) => ({
      id: booking.id,
      user_id: booking.user_id,
      room_id: booking.room_id,
      guest_name: booking.guest_name,
      guest_phone: booking.guest_phone,
      guest_email: booking.guest_email,
      room_type: booking.room_type,
      check_in: booking.check_in?.toISOString() || null,
      booking_status: booking.booking_status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    }));
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

    // Transform the data to match the schema
    return bookings.map((booking) => ({
      id: booking.id,
      user_id: booking.user_id,
      room_id: booking.room_id,
      guest_name: booking.guest_name,
      guest_phone: booking.guest_phone,
      guest_email: booking.guest_email,
      room_type: booking.room_type,
      check_in: booking.check_in?.toISOString() || null,
      booking_status: booking.booking_status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    }));
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

    if (!booking) return null;

    // Transform the data to match the schema
    return {
      id: booking.id,
      user_id: booking.user_id,
      room_id: booking.room_id,
      guest_name: booking.guest_name,
      guest_phone: booking.guest_phone,
      guest_email: booking.guest_email,
      room_type: booking.room_type,
      check_in: booking.check_in?.toISOString() || null,
      booking_status: booking.booking_status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    };
  } catch (error) {
    console.error('Prisma Find Error:', error);
    throw handlePrismaError(error);
  }
}

//check if room already has active bookings (pending or confirmed)
export async function checkRoomAvailability(roomId: number) {
  try {
    const existingBookings = await prisma.apartment_booking.findMany({
      where: {
        room_id: roomId,
        booking_status: {
          in: ['pending', 'confirmed'],
        },
      },
    });

    return existingBookings.length === 0; // true if room is available (no active bookings)
  } catch (error) {
    console.error('Prisma Room Availability Check Error:', error);
    throw handlePrismaError(error);
  }
}

//get existing bookings for a specific room (for debugging/admin)
export async function getBookingsByRoomId(roomId: number) {
  try {
    const bookings = await prisma.apartment_booking.findMany({
      where: {
        room_id: roomId,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Transform the data to match the schema
    return bookings.map((booking) => ({
      id: booking.id,
      user_id: booking.user_id,
      room_id: booking.room_id,
      guest_name: booking.guest_name,
      guest_phone: booking.guest_phone,
      guest_email: booking.guest_email,
      room_type: booking.room_type,
      check_in: booking.check_in?.toISOString() || null,
      booking_status: booking.booking_status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    }));
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
        check_in: data.check_in ? new Date(data.check_in) : null,
      },
    });
    await prisma.room.update({
      where: {
        id: newBooking.room_id!,
      },
      data: {
        room_status: 'occupied',
      },
    });

    // Transform the response to match the schema
    return {
      id: newBooking.id,
      user_id: newBooking.user_id,
      room_id: newBooking.room_id,
      guest_name: newBooking.guest_name,
      guest_phone: newBooking.guest_phone,
      guest_email: newBooking.guest_email,
      room_type: newBooking.room_type,
      check_in: newBooking.check_in?.toISOString() || null,
      booking_status: newBooking.booking_status,
      created_at: newBooking.created_at,
      updated_at: newBooking.updated_at,
    };
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
        check_in: data.check_in ? new Date(data.check_in) : null,
      },
    });

    return {
      id: updatedBooking.id,
      user_id: updatedBooking.user_id,
      room_id: updatedBooking.room_id,
      guest_name: updatedBooking.guest_name,
      guest_phone: updatedBooking.guest_phone,
      guest_email: updatedBooking.guest_email,
      room_type: updatedBooking.room_type,
      check_in: updatedBooking.check_in?.toISOString() || null,
      booking_status: updatedBooking.booking_status,
      created_at: updatedBooking.created_at,
      updated_at: updatedBooking.updated_at,
    };
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

    if (deletedBooking.room_id) {
      await prisma.room.update({
        where: {
          id: deletedBooking.room_id,
        },
        data: {
          room_status: 'available',
        },
      });
    }

    return deletedBooking;
  } catch (error) {
    console.error('Prisma Delete Error:', error);
    throw handlePrismaError(error);
  }
}
