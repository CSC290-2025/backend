import type { OpenAPIHono } from '@hono/zod-openapi';
import { UserSchemas } from '../schemas';
import { UserG1Controller } from '../controllers';

const setupUserG1Routes = (app: OpenAPIHono) => {
  app.openapi(UserSchemas.getUserAddress, UserG1Controller.getUserAddress);
};

export { setupUserG1Routes };
