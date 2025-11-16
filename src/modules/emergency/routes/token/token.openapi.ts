import { TokenController } from '@/modules/emergency/controllers';
import { RouteSchemas } from '@/modules/emergency/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupTokenRoutes = (app: OpenAPIHono) => {
  app.openapi(
    RouteSchemas.Token.createTokenFcmRoute,
    TokenController.storeTokenToDB
  );
};

export { setupTokenRoutes };
