// source/traffic/routes/traffic-light.openapi.routes.ts
import type { OpenAPIHono } from '@hono/zod-openapi';
import { TrafficLightSchemas } from '../schemas';
import { TrafficLightController, LightRequestController } from '../controllers';

const setupTrafficLightRoutes = (app: OpenAPIHono) => {
  // Main CRUD operations
  app.openapi(
    TrafficLightSchemas.getTrafficLightRoute,
    TrafficLightController.getTrafficLight
  );

  app.openapi(
    TrafficLightSchemas.createTrafficLightRoute,
    TrafficLightController.createTrafficLight
  );

  app.openapi(
    TrafficLightSchemas.updateTrafficLightRoute,
    TrafficLightController.updateTrafficLight
  );

  app.openapi(
    TrafficLightSchemas.deleteTrafficLightRoute,
    TrafficLightController.deleteTrafficLight
  );

  app.openapi(
    TrafficLightSchemas.listTrafficLightsRoute,
    TrafficLightController.listTrafficLights
  );

  // Intersection and road operations
  app.openapi(
    TrafficLightSchemas.getTrafficLightsByIntersectionRoute,
    TrafficLightController.getTrafficLightsByIntersection
  );

  app.openapi(
    TrafficLightSchemas.getTrafficLightsByRoadRoute,
    TrafficLightController.getTrafficLightsByRoad
  );

  // Traffic density and timing operations
  app.openapi(
    TrafficLightSchemas.calculateDensityRoute,
    TrafficLightController.calculateDensity
  );

  app.openapi(
    TrafficLightSchemas.updateTimingRoute,
    TrafficLightController.updateTiming
  );

  // Light request operations
  app.openapi(
    TrafficLightSchemas.createLightRequestRoute,
    LightRequestController.createLightRequest
  );

  app.openapi(
    TrafficLightSchemas.getLightRequestsRoute,
    LightRequestController.getLightRequest
  );
};

export { setupTrafficLightRoutes };
