import type { OpenAPIHono } from '@hono/zod-openapi';
import { EmergencyCallSchemas } from '../schemas';
import { EmergencyCallController } from '../controllers';

const setupEmergencyCallRoutes = (app: OpenAPIHono) => {
  app.openapi(
    EmergencyCallSchemas.listEmergencyCallsRoute,
    EmergencyCallController.listEmergencyCalls
  );
  app.openapi(
    EmergencyCallSchemas.getEmergencyCallRoute,
    EmergencyCallController.getEmergencyCall
  );
  app.openapi(
    EmergencyCallSchemas.createEmergencyCallRoute,
    EmergencyCallController.createEmergencyCall
  );
  app.openapi(
    EmergencyCallSchemas.updateEmergencyCallRoute,
    EmergencyCallController.updateEmergencyCall
  );
  app.openapi(
    EmergencyCallSchemas.deleteEmergencyCallRoute,
    EmergencyCallController.deleteEmergencyCall
  );
};

export { setupEmergencyCallRoutes };
