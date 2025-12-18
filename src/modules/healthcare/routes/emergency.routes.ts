import type { OpenAPIHono } from '@hono/zod-openapi';
import * as EmergencyController from '../controllers/emergency.controller';
import * as EmergencySchemas from '../schemas/emergency.schemas';

export const setupEmergencyRoutes = (app: OpenAPIHono) => {
  app.openapi(
    EmergencySchemas.getActiveEmergenciesRoute,
    EmergencyController.getActiveEmergencies
  );
};
