import type { OpenAPIHono } from '@hono/zod-openapi';
import { ResetController } from '../controllers';
import { ResetSchemas } from '../schemas';

const setupResetRoutes = (app: OpenAPIHono) => {
  app.openapi(ResetSchemas.forgetPasswordRoute, ResetController.forgetPassword);
  app.openapi(ResetSchemas.verifyTokenRoute, ResetController.verifyToken);
  app.openapi(ResetSchemas.changePassword, ResetController.changePassword);
};

export { setupResetRoutes };
