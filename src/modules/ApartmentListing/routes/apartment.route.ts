import * as apartmentController from '../controllers/apartment.Controller';
import type { OpenAPIHono } from '@hono/zod-openapi';
import { ApartmentSchemas } from '../schemas';

const setupApartmentRoutes = (app: OpenAPIHono) => {
  app.openapi(
    ApartmentSchemas.CreateApartmentRoute,
    apartmentController.createApartment
  );
  app.openapi(
    ApartmentSchemas.getApartmentbyIDRoute,
    apartmentController.getApartmentByID
  );
  app.openapi(
    ApartmentSchemas.getAllApartmentsRoute,
    apartmentController.getAllApartment
  );
  app.openapi(
    ApartmentSchemas.UpdateApartmentRoute,
    apartmentController.updateApartment
  );
  app.openapi(
    ApartmentSchemas.DeleteApartmentRoute,
    apartmentController.deleteApartment
  );
  app.openapi(
    ApartmentSchemas.apartmentFilterRoute,
    apartmentController.filterApartments
  );
  app.openapi(
    ApartmentSchemas.countAvailableRoomsRoute,
    apartmentController.countAvailableRooms
  );
  app.openapi(
    ApartmentSchemas.getApartmentsByUserRoute,
    apartmentController.getApartmentbyUser
  );
  app.openapi(
    ApartmentSchemas.getRoomPriceRangeRoute,
    apartmentController.getRoomPriceRange
  );
};

export { setupApartmentRoutes };
