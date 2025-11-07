import { successResponse } from '@/utils/response';
import { bookingService } from '../service/index.ts';
import type { Context } from 'hono';

export async function getAllBookings(c: Context) {
  const bookings = await bookingService.getAllBookings();
  return successResponse(c, bookings);
}

export async function getBookingById(c: Context) {
  const id = Number(c.req.param('id'));
  const booking = await bookingService.getBookingById(id);
  return successResponse(c, booking);
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
export async function deleteBooking(c: Context) {
  const id = Number(c.req.param('id'));
  await bookingService.deleteBooking(id);
  return successResponse(c, 204);
}
