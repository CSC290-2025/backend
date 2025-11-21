import type { OpenAPIHono } from '@hono/zod-openapi';
import { AmbulanceSchemas } from '../schemas';
import { AmbulanceController } from '../controllers';

const setupAmbulanceRoutes = (app: OpenAPIHono) => {
  app.openapi(
    AmbulanceSchemas.listAmbulancesRoute,
    AmbulanceController.listAmbulances
  );
  app.openapi(
    AmbulanceSchemas.getAmbulanceRoute,
    AmbulanceController.getAmbulance
  );
  app.openapi(
    AmbulanceSchemas.createAmbulanceRoute,
    AmbulanceController.createAmbulance
  );
  app.openapi(
    AmbulanceSchemas.updateAmbulanceRoute,
    AmbulanceController.updateAmbulance
  );
  app.openapi(
    AmbulanceSchemas.deleteAmbulanceRoute,
    AmbulanceController.deleteAmbulance
  );
};

export { setupAmbulanceRoutes };
