import { LocationIQSchemas } from '@/modules/ApartmentListing/schemas';
import { locationIQController } from '@/modules/ApartmentListing/controllers/index';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupAPTLocationIQRoutes = (app: OpenAPIHono) => {
  app.openapi(
    LocationIQSchemas.getAPTCoordRoute,
    locationIQController.getCoords
  );
  app.openapi(
    LocationIQSchemas.getNearbyPlacesRoute,
    locationIQController.getNearbyPlacesFilteredController
  );
  app.openapi(
    LocationIQSchemas.getDistanceRoute,
    locationIQController.getDistanceController
  );
};

export { setupAPTLocationIQRoutes };
