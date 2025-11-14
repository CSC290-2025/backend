import type { OpenAPIHono } from '@hono/zod-openapi';
import { UserSpecialtySchemas } from '../schemas';
import { UserSpecialtyG1Controller } from '../controllers';

const setupUserSpecialtyRoutes = (app: OpenAPIHono) => {
  app.openapi(
    UserSpecialtySchemas.createUserSpecialty,
    UserSpecialtyG1Controller.createUserSpecialty
  );
};

export { setupUserSpecialtyRoutes };
