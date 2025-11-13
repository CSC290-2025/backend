import { successResponse } from '@/utils/response';
import { bookingService } from '../service';
import type { Context } from 'hono';

export async function getAllBookingsForUser(c: Context) {
  const userId = Number(c.req.param('userId'));
  const bookings = await bookingService.getAllBookingForUserService(userId);
  return successResponse(c, bookings);
}

export async function getBookingById(c: Context) {
  const id = Number(c.req.param('id'));
  const booking = await bookingService.getBookingById(id);
  return successResponse(c, booking);
}

export async function getBookingsByApartmentId(c: Context) {
  const id = Number(c.req.param('id'));
  const bookings = await bookingService.getBookingsByApartmentId(id);
  return successResponse(c, bookings);
}

export async function createBooking(c: Context) {
  const data = await c.req.json();
  const newBooking = await bookingService.createBooking(data);
  return successResponse(c, newBooking, 201);
}
export async function updateBooking(c: Context) {
  const id = Number(c.req.param('id'));
  const data = await c.req.json();
  const updatedBooking = await bookingService.updateBooking(data, id);
  return successResponse(c, updatedBooking);
}

export async function updateBookingStatus(c: Context) {
  const id = Number(c.req.param('id'));
  const { booking_status } = await c.req.json();
  const updatedBooking = await bookingService.updateBookingStatus(
    booking_status,
    id
  );
  return successResponse(c, updatedBooking);
}

export async function deleteBooking(c: Context) {
  const id = Number(c.req.param('id'));
  await bookingService.deleteBooking(id);
  return successResponse(c, 204);
}
