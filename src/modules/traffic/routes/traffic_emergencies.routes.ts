import type { OpenAPIHono } from '@hono/zod-openapi';
import { TrafficEmergencySchemas } from '../schemas';
import { TrafficEmergencyController } from '../controllers';

export const setupTrafficEmergencyRoutes = (app: OpenAPIHono) => {
  // Public routes
  app.openapi(
    TrafficEmergencySchemas.getTrafficEmergenciesByStatusRoute,
    TrafficEmergencyController.getTrafficEmergenciesByStatus
  );
  app.openapi(
    TrafficEmergencySchemas.getTrafficEmergencyStatsRoute,
    TrafficEmergencyController.getTrafficEmergencyStats
  );

  // User routes
  app.openapi(
    TrafficEmergencySchemas.getTrafficEmergencyRoute,
    TrafficEmergencyController.getTrafficEmergency
  );
  app.openapi(
    TrafficEmergencySchemas.listTrafficEmergenciesRoute,
    TrafficEmergencyController.listTrafficEmergencies
  );
  app.openapi(
    TrafficEmergencySchemas.getTrafficEmergenciesByUserRoute,
    TrafficEmergencyController.getTrafficEmergenciesByUser
  );
  app.openapi(
    TrafficEmergencySchemas.createTrafficEmergencyRoute,
    TrafficEmergencyController.createTrafficEmergency
  );

  // Admin routes
  app.openapi(
    TrafficEmergencySchemas.adminUpdateTrafficEmergencyRoute,
    TrafficEmergencyController.updateTrafficEmergency
  );
  app.openapi(
    TrafficEmergencySchemas.adminDeleteTrafficEmergencyRoute,
    TrafficEmergencyController.deleteTrafficEmergency
  );
};
