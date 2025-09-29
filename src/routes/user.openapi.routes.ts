import type { OpenAPIHono } from '@hono/zod-openapi';
import { UserSchemas } from '@/schemas';
import { UserController } from '@/controllers';

const setupUserRoutes = (app: OpenAPIHono) => {
  app.openapi(UserSchemas.getUsersRoute, UserController.getUsers);
  app.openapi(UserSchemas.getUserRoute, UserController.getUser);
  app.openapi(UserSchemas.createUserRoute, UserController.createUser);
  app.openapi(UserSchemas.updateUserRoute, UserController.updateUser);
  app.openapi(UserSchemas.deleteUserRoute, UserController.deleteUser);
};

export { setupUserRoutes };
