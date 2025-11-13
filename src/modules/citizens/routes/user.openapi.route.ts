import type { OpenAPIHono } from '@hono/zod-openapi';
import { UserSchemas } from '../schemas/user.schema';
import { UserG2 } from '../controllers';

const setupUserRoutes = (app: OpenAPIHono) => {
  app.openapi(UserSchemas.getUserProflie, UserG2.getUserProflie);
};

export { setupUserRoutes };
