import type { OpenAPIHono } from '@hono/zod-openapi';
import { TrafficLightSchemas } from '../schemas';
import { TrafficLightController } from '../controllers';

export const setupTrafficLightRoutes = (app: OpenAPIHono) => {
  // Register static status route before dynamic :id route to avoid param capture
  app.openapi(
    TrafficLightSchemas.getAllStatusRoute,
    TrafficLightController.getAllStatus
  );

  // SSE: stream traffic light status changes (clients can filter for broken/maintenance)
  // Register this static route before any dynamic `:id` routes so the literal
  // path `stream` isn't captured by `:id` and rejected by OpenAPI/Zod validation.
  app.get('/traffic-lights/stream', TrafficLightController.streamBroken);

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
