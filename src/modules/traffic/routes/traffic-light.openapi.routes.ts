import type { OpenAPIHono } from '@hono/zod-openapi';
import { TrafficLightSchemas } from '../schemas';
import { TrafficLightController } from '../controllers';

export const setupTrafficLightRoutes = (app: OpenAPIHono) => {
  // Register static status route before dynamic :id route to avoid param capture
  app.openapi(
    TrafficLightSchemas.getAllStatusRoute,
    TrafficLightController.getAllStatus
  );

  app.openapi(
    TrafficLightSchemas.getTrafficDataForCalculationRoute,
    TrafficLightController.getTrafficDataForCalculation
  );

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

  // PATCH route - use normal Hono route (no OpenAPI validation) to allow any body structure
  app.patch('/traffic-lights/:id', TrafficLightController.patchTrafficLight);

  // SSE: stream traffic light status changes (clients can filter for broken/maintenance)
  app.get('/traffic-lights/stream', TrafficLightController.streamBroken);

  app.openapi(
    TrafficLightSchemas.deleteTrafficLightRoute,
    TrafficLightController.deleteTrafficLight
  );

  app.openapi(
    TrafficLightSchemas.listTrafficLightsRoute,
    TrafficLightController.listTrafficLights
  );

  app.openapi(
    TrafficLightSchemas.getTrafficLightsByIntersectionRoute,
    TrafficLightController.getTrafficLightsByIntersection
  );

  app.openapi(
    TrafficLightSchemas.getTrafficLightsByRoadRoute,
    TrafficLightController.getTrafficLightsByRoad
  );
};
