import {
  createDeleteRoute,
  createGetRoute,
  createPostRoute,
  createPutRoute,
} from '@/utils/openapi-helpers';
import { z } from 'zod';

const bookingSchema = z.object({
  id: z.int(),
  user_id: z.int(),
  room_id: z.int().nullable(),
  guest_name: z.string().min(2).max(255).nullable(),
  guest_phone: z.string().min(10).max(10).nullable(),
  guest_email: z.string().email().nullable(),
  room_type: z.string().min(2).max(255).nullable(),
  check_in: z.string().datetime().nullable(),
  booking_status: z
    .enum(['pending', 'confirmed', 'cancelled'])
    .default('pending')
    .nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

const bookingListSchema = z.array(bookingSchema);

const createbookingSchema = z.object({
  user_id: z.int(),
  room_id: z.int().nullable(),
  guest_name: z.string().min(2).max(255).nullable(),
  guest_phone: z.string().min(10).max(10).nullable(),
  guest_email: z.string().email().nullable(),
  room_type: z.string().min(2).max(255).nullable(),
  check_in: z.string().datetime().nullable(),
});

const updatebookingSchema = z.object({
  user_id: z.int(),
  room_id: z.int().nullable(),
  guest_name: z.string().min(2).max(255).nullable(),
  guest_phone: z.string().min(10).max(10).nullable(),
  guest_email: z.string().email().nullable(),
  room_type: z.string().min(2).max(255).nullable(),
  booking_status: z.enum(['pending', 'confirmed', 'cancelled']).nullable(),
  check_in: z.string().datetime().nullable(),
});

const bookingIdParam = z.object({
  id: z.string(),
});

const UpdatebookingParamsSchema = z.object({
  id: z.string(),
});

const DeletebookingParamsSchema = z.object({
  id: z.string(),
});

//openAPI
const createBookingRoute = createPostRoute({
  path: '/bookings',
  summary: 'Create a new booking',
  requestSchema: createbookingSchema,
  responseSchema: bookingSchema,
  tags: ['booking'],
});

const updateBookingRoute = createPutRoute({
  path: '/bookings/{id}',
  summary: 'Update an existing booking',
  requestSchema: updatebookingSchema,
  responseSchema: bookingSchema,
  params: UpdatebookingParamsSchema,
  tags: ['booking'],
});
const updateBookingStatusRoute = createPutRoute({
  path: '/bookings/{id}/status',
  summary: 'Update booking status',
  requestSchema: z.object({
    booking_status: z.enum(['pending', 'confirmed', 'cancelled']).nullable(),
  }),
  params: bookingIdParam,
  responseSchema: bookingSchema,
  tags: ['booking'],
});

const deleteBookingRoute = createDeleteRoute({
  path: '/bookings/{id}',
  summary: 'Delete an existing booking',
  params: DeletebookingParamsSchema,
  tags: ['booking'],
});

const getBookingsByApartmentIdRoute = createGetRoute({
  path: '/bookings/apartment/{id}',
  summary: 'Get all bookings for a specific apartment',
  params: bookingIdParam,
  responseSchema: bookingListSchema,
  tags: ['booking'],
});

const getAllBookingsForUserRoute = createGetRoute({
  path: '/bookings/user/{userId}',
  summary: 'Get all bookings for a specific user',
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
  responseSchema: bookingListSchema,
  tags: ['booking'],
});

const getBookingByIdRoute = createGetRoute({
  path: '/bookings/{id}',
  summary: 'Get a booking by ID',
  params: bookingIdParam,
  responseSchema: bookingSchema,
  tags: ['booking'],
});

export const bookingSchemas = {
  createbookingSchema,
  updatebookingSchema,
  bookingIdParam,
  bookingSchema,
  createBookingRoute,
  updateBookingRoute,
  deleteBookingRoute,
  getBookingsByApartmentIdRoute,
  getAllBookingsForUserRoute,
  bookingListSchema,
  getBookingByIdRoute,
  updateBookingStatusRoute,
};
