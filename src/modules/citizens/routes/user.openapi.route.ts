import type { OpenAPIHono } from '@hono/zod-openapi';
import { UserSchemas } from '../schemas/user.schema';
import { UserG2 } from '../controllers';

const setupUserRoutes = (app: OpenAPIHono) => {
  app.openapi(UserSchemas.getUserProflie, UserG2.getUserProflie);
  app.openapi(UserSchemas.updateUserPersonal, UserG2.updateUserPersonalData);
  app.openapi(UserSchemas.updateUserHealth, UserG2.updateUserHealthData);
  app.openapi(UserSchemas.updateUserAccount, UserG2.updateUserAccountData);
  app.openapi(UserSchemas.getCurrentUserProfile, UserG2.getCurrentUserProfile);
  app.openapi(
    UserSchemas.updateCurrentUserPersonal,
    UserG2.updateCurrentUserPersonal
  );
  app.openapi(
    UserSchemas.updateCurrentUserHealth,
    UserG2.updateCurrentUserHealth
  );
  app.openapi(
    UserSchemas.updateCurrentUserAccount,
    UserG2.updateCurrentUserAccount
  );
};

export { setupUserRoutes };
