import type { OpenAPIHono } from '@hono/zod-openapi';
import { FacilitySchemas } from '../schemas';
import { FacilityController } from '../controllers';

const setupFacilityRoutes = (app: OpenAPIHono) => {
  app.openapi(
    FacilitySchemas.listFacilitiesRoute,
    FacilityController.listFacilities
  );
  app.openapi(FacilitySchemas.getFacilityRoute, FacilityController.getFacility);
  app.openapi(
    FacilitySchemas.createFacilityRoute,
    FacilityController.createFacility
  );
  app.openapi(
    FacilitySchemas.updateFacilityRoute,
    FacilityController.updateFacility
  );
  app.openapi(
    FacilitySchemas.deleteFacilityRoute,
    FacilityController.deleteFacility
  );
};

export { setupFacilityRoutes };
