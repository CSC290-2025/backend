import { FcmController } from '@/modules/emergency/controllers';
import { RouteSchemas } from '@/modules/emergency/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupFcmRoutes = (app: OpenAPIHono) => {
  app.openapi(
    RouteSchemas.Fcm.createFcmRoute,
    FcmController.sendAllNotification
  );
  app.openapi(
    RouteSchemas.Fcm.sendNotificationToToken,
    FcmController.sendNotificationToToken
  );
};

export { setupFcmRoutes };
