import type { OpenAPIHono } from '@hono/zod-openapi';
import { AuthController } from '../controllers';
import { AuthSchemas } from '../schemas';

const setupAuthRoutes = (app: OpenAPIHono) => {
  app.openapi(AuthSchemas.loginRoute, AuthController.login);
  app.openapi(AuthSchemas.registerRoute, AuthController.register);
  app.openapi(AuthSchemas.refreshTokenRoute, AuthController.refreshToken);
  app.openapi(AuthSchemas.logoutRoute, AuthController.logout);
  app.openapi(AuthSchemas.meRoute, AuthController.me);
};

export { setupAuthRoutes };
