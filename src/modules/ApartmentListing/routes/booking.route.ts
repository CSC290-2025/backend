import type { OpenAPIHono } from '@hono/zod-openapi';
import * as bookingControllers from '../controllers/booking.Controller';
import { bookingSchemas } from '../schemas';

const setupBookingRoutes = (app: OpenAPIHono) => {
  app.openapi(
    bookingSchemas.createBookingRoute,
    bookingControllers.createBooking
  );
  app.openapi(
    bookingSchemas.getAllBookingsRoute,
    bookingControllers.getAllBookings
  );
  app.openapi(
    bookingSchemas.getBookingByIdRoute,
    bookingControllers.getBookingById
  );
  app.openapi(
    bookingSchemas.updateBookingRoute,
    bookingControllers.updateBooking
  );
  app.openapi(
    bookingSchemas.deleteBookingRoute,
    bookingControllers.deleteBooking
  );
};

export { setupBookingRoutes };
