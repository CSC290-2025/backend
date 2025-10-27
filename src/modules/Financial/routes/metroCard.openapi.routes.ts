import { MetroCardSchemas } from '../schemas';
import { MetroCardController } from '../controllers';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupMetroCardRoutes = (app: OpenAPIHono) => {
  // MetroCard routes
  app.openapi(
    MetroCardSchemas.createMetroCardRoute,
    MetroCardController.createMetroCard
  );
};

export { setupMetroCardRoutes };
