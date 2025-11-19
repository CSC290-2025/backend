import type { OpenAPIHono } from '@hono/zod-openapi';
import { UserSchemas } from '../schemas/user.schema';
import { UserG8Controller } from '../controllers';

const setupUserG8Routes = (app: OpenAPIHono) => {
  app.openapi(
    UserSchemas.getUserinfoAndWallet,
    UserG8Controller.getUserinfoAndWallet
  );
};

export { setupUserG8Routes };
