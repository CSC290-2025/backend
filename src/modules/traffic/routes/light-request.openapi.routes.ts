import type { OpenAPIHono } from '@hono/zod-openapi';
import { LightRequestSchemas, VehicleSchemas } from '../schemas';
import { LightRequestController, VehicleController } from '../controllers';

const setupLightRequestRoutes = (app: OpenAPIHono) => {
  // Light Request Routes
  app.openapi(
    LightRequestSchemas.createRequestRoute,
    LightRequestController.createLightRequest
  );
  app.openapi(
    LightRequestSchemas.getRequestsRoute,
    LightRequestController.getLightRequests
  );

  // Vehicle Routes
  app.openapi(
    VehicleSchemas.updateLocationRoute,
    VehicleController.updateVehicleLocation
  );
  app.openapi(VehicleSchemas.getVehicleRoute, VehicleController.getVehicle);
};

export { setupLightRequestRoutes };
