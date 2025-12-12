import type { OpenAPIHono } from '@hono/zod-openapi';
import { BedSchemas } from '../schemas';
import { BedController } from '../controllers';

const setupBedRoutes = (app: OpenAPIHono) => {
  app.openapi(BedSchemas.listBedsRoute, BedController.listBeds);
  app.openapi(BedSchemas.getBedRoute, BedController.getBed);
  app.openapi(BedSchemas.createBedRoute, BedController.createBed);
  app.openapi(BedSchemas.updateBedRoute, BedController.updateBed);
  app.openapi(BedSchemas.deleteBedRoute, BedController.deleteBed);
};

export { setupBedRoutes };
