//handles ALL traffic-related OpenAPI routes
import type { OpenAPIHono } from '@hono/zod-openapi';
import {
  TrafficLightSchemas,
  LightRequestSchemas,
  VehicleSchemas,
} from '../schemas';
import {
  TrafficLightController,
  LightRequestController,
  VehicleController,
} from '../controllers';

export const setupTrafficRoutes = (app: OpenAPIHono) => {
  // ============================================
  // TRAFFIC LIGHT ROUTES
  // ============================================

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

  // ============================================
  // LIGHT REQUEST ROUTES
  // ============================================

  app.openapi(
    LightRequestSchemas.createRequestRoute,
    LightRequestController.createLightRequest
  );

  app.openapi(
    LightRequestSchemas.getRequestsRoute,
    LightRequestController.getLightRequests
  );

  // ============================================
  // VEHICLE ROUTES
  // ============================================

  app.openapi(
    VehicleSchemas.updateLocationRoute,
    VehicleController.updateVehicleLocation
  );

  app.openapi(VehicleSchemas.getVehicleRoute, VehicleController.getVehicle);
};
