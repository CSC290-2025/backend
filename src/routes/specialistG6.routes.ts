// src/modules/specialists/routes/userSpecialist.routes.ts
import type { OpenAPIHono } from '@hono/zod-openapi';
import { UserSpecialistSchemas } from '@/modules/citizens/schemas/specialist.schema';
import { userSpecialistController } from '@/modules/citizens/controllers/specialistG6.controller';

export const setupUserSpecialistRoutes = (app: OpenAPIHono) => {
  app.openapi(
    UserSpecialistSchemas.getUserSpecialistsRoute,
    userSpecialistController.getUserSpecialists
  );
};
