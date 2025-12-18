import { LocationSchemas } from '../schemas';
import { LocationController } from '../controllers';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupLocationRoutes = (app: OpenAPIHono) => {
  // Location routes
  app.openapi(
    LocationSchemas.getNearbyPlacesRoute,
    LocationController.getNearbyPlaces
  );
};

export { setupLocationRoutes };
