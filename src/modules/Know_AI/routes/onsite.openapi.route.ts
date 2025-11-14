import { OnsiteSessionController } from '@/modules/Know_AI/controllers';
import { onsiteSchemas } from '@/modules/Know_AI/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupOnsiteSessionRoutes = (app: OpenAPIHono) => {
  app.openapi(
    onsiteSchemas.getAllOnsite,
    OnsiteSessionController.getAllOnsiteSession
  );
  app.openapi(
    onsiteSchemas.getOnsite,
    OnsiteSessionController.getOnsiteSessionById
  );
  app.openapi(
    onsiteSchemas.createOnsiteRoute,
    OnsiteSessionController.createOnsiteSession
  );
  app.openapi(
    onsiteSchemas.deleteOnsiteRoute,
    OnsiteSessionController.deleteOnsiteSession
  );
};

export { setupOnsiteSessionRoutes };
