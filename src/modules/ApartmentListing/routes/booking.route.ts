import type { OpenAPIHono } from '@hono/zod-openapi';
import * as bookingControllers from '../controllers/booking.Controller';
import { bookingSchemas } from '../schemas';

const setupBookingRoutes = (app: OpenAPIHono) => {
  app.openapi(
    bookingSchemas.createBookingRoute,
    bookingControllers.createBooking
  );
  app.openapi(
    bookingSchemas.getAllBookingsForUserRoute,
    bookingControllers.getAllBookingsForUser
  );
  app.openapi(
    bookingSchemas.getBookingByIdRoute,
    bookingControllers.getBookingById
  );
  app.openapi(
    bookingSchemas.getBookingsByApartmentIdRoute,
    bookingControllers.getBookingsByApartmentId
  );
  app.openapi(
    bookingSchemas.updateBookingRoute,
    bookingControllers.updateBooking
  );
  app.openapi(
    bookingSchemas.updateBookingStatusRoute,
    bookingControllers.updateBookingStatus
  );
  app.openapi(
    bookingSchemas.deleteBookingRoute,
    bookingControllers.deleteBooking
  );
};

export { setupBookingRoutes };
