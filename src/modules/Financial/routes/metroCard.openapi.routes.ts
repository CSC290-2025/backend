import { MetroCardSchemas } from '../schemas';
import { MetroCardController } from '../controllers';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupMetroCardRoutes = (app: OpenAPIHono) => {
  // MetroCard routes
  app.openapi(
    MetroCardSchemas.createMetroCardRoute,
    MetroCardController.createMetroCard
  );
  app.openapi(
    MetroCardSchemas.getMetroCardRoute,
    MetroCardController.getMetroCard
  );
  app.openapi(
    MetroCardSchemas.getUserMetroCardRoute,
    MetroCardController.getUserMetroCards
  );
  app.openapi(
    MetroCardSchemas.updateMetroCardRoute,
    MetroCardController.updateMetroCard
  );
  app.openapi(
    MetroCardSchemas.topUpBalanceRoute,
    MetroCardController.topUpBalance
  );
  app.openapi(
    MetroCardSchemas.deleteMetroCardRoute,
    MetroCardController.deleteMetroCard
  );
  app.openapi(
    MetroCardSchemas.transferToTransportationRoute,
    MetroCardController.transferToTransportation
  );
};

export { setupMetroCardRoutes };
