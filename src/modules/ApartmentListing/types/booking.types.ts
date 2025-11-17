import type { z } from 'zod';
import type { bookingSchemas } from '../schemas';

type Booking = z.infer<typeof bookingSchemas.bookingSchema>;
type createBookingData = z.infer<typeof bookingSchemas.createbookingSchema>;
type updateBookingData = z.infer<typeof bookingSchemas.updatebookingSchema>;

export type { Booking, createBookingData, updateBookingData };
