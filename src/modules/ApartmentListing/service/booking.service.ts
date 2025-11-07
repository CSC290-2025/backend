import { bookingModel } from '../models';
import { NotFoundError, ValidationError } from '@/errors';
import type { Booking, createBookingData, updateBookingData } from '../types';
import { getApartmentByID } from './apartment.service';

const getBookingById = async (id: number): Promise<Booking> => {
  const booking = await bookingModel.getBookingById(id);
  if (!booking) throw new NotFoundError('Booking not found');
  return booking;
};

const getAllBookings = async (): Promise<Booking[]> => {
  const bookings = await bookingModel.getAllBookings();
  if (!bookings) throw new NotFoundError('No bookings found');
  return bookings;
};

const createBooking = async (data: createBookingData): Promise<Booking> => {
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

  const updatedBooking = await bookingModel.updateBooking(id, data);
  if (!updatedBooking) throw new Error('Failed to update booking');
  return updatedBooking;
};
const deleteBooking = async (id: number): Promise<void> => {
  const existingBooking = await bookingModel.getBookingById(id);
  if (!existingBooking) throw new NotFoundError('Booking not found');
  await bookingModel.deleteBooking(id);
};

export {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
};
