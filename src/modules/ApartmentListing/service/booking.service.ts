import { bookingModel, roomModel } from '../models';
import { NotFoundError, ConflictError } from '@/errors';
import type {
  Booking,
  createBookingData,
  updateBookingData,
  updateRoomData,
} from '../types';

const getBookingById = async (id: number): Promise<Booking> => {
  const booking = await bookingModel.getBookingById(id);
  if (!booking) throw new NotFoundError('Booking not found');
  return booking;
};

const getAllBookingForUserService = async (
  userId: number
): Promise<Booking[]> => {
  const bookings = await bookingModel.getAllBookingsForUser(userId);
  if (!bookings) throw new NotFoundError('No bookings found');
  return bookings;
};

const getBookingsByApartmentId = async (
  apartmentId: number
): Promise<Booking[]> => {
  const bookings = await bookingModel.getBookingsByApartmentId(apartmentId);
  if (!bookings)
    throw new NotFoundError('No bookings found for this apartment');
  return bookings;
};

const createBooking = async (data: createBookingData): Promise<Booking> => {
  // Only check room availability if a specific room is selected
  if (data.room_id !== null && data.room_id !== undefined) {
    const isRoomAvailable = await bookingModel.checkRoomAvailability(
      data.room_id
    );
    if (!isRoomAvailable) {
      throw new ConflictError(
        'This room is already booked. Please choose a different room or check back later.'
      );
    }
  }

  const booking = await bookingModel.createBooking(data);
  if (!booking) throw new NotFoundError('Failed to create booking');
  return booking;
};

const updateBooking = async (
  data: updateBookingData,
  id: number
): Promise<Booking> => {
  const existingBooking = await bookingModel.getBookingById(id);
  if (!existingBooking) throw new NotFoundError('Booking not found');

  // Prevent room changes: users cannot update to a different room
  if (data.room_id && data.room_id !== existingBooking.room_id) {
    throw new ConflictError(
      'Room changes are not allowed. Please cancel this booking and create a new one if you need a different room.'
    );
  }

  const updatedBooking = await bookingModel.updateBooking(id, data);
  if (!updatedBooking) throw new Error('Failed to update booking');
  return updatedBooking;
};

const updateBookingStatus = async (
  status: 'pending' | 'confirmed' | 'cancelled' | null,
  id: number
): Promise<Booking> => {
  const existingBooking = await bookingModel.getBookingById(id);
  if (!existingBooking) throw new NotFoundError('Booking not found');
  const room = await roomModel.getRoomByID(existingBooking.room_id!);
  if (!room) throw new NotFoundError('Associated room not found');

  // Handle room status updates based on booking status
  if (status === 'cancelled') {
    const updateRoomStatus: updateRoomData = {
      room_status: 'available',
    };
    await roomModel.updateRoom(existingBooking.room_id!, updateRoomStatus);
  } else if (status === 'confirmed') {
    const updateRoomStatus: updateRoomData = {
      room_status: 'occupied',
    };
    await roomModel.updateRoom(existingBooking.room_id!, updateRoomStatus);
  }

  const updateData: updateBookingData = {
    user_id: existingBooking.user_id,
    room_id: existingBooking.room_id,
    guest_name: existingBooking.guest_name,
    guest_phone: existingBooking.guest_phone,
    guest_email: existingBooking.guest_email,
    room_type: existingBooking.room_type,
    booking_status: status,
    check_in: existingBooking.check_in,
  };

  const updatedBooking = await bookingModel.updateBooking(
    existingBooking.id,
    updateData
  );
  if (!updatedBooking) throw new Error('Failed to update booking status');
  return updatedBooking;
};

const deleteBooking = async (id: number): Promise<void> => {
  const existingBooking = await bookingModel.getBookingById(id);
  if (!existingBooking) throw new NotFoundError('Booking not found');
  await bookingModel.deleteBooking(id);
};

export {
  getAllBookingForUserService,
  getBookingById,
  getBookingsByApartmentId,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
};
