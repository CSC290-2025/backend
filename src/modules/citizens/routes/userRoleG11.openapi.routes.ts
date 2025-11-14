import type { OpenAPIHono } from '@hono/zod-openapi';
import { UserG2 } from '../controllers';
import { userRoleSchema } from '../schemas/userRole.schema';

const setupRoleUserRoutes = (app: OpenAPIHono) => {
  app.openapi(userRoleSchema.getUsersByRoleRoute, UserG2.getUsersByRole);
};

export { setupRoleUserRoutes };
