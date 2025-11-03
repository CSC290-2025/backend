// source/routes/traffic.openapi.routes.ts
// This file handles ALL traffic-related OpenAPI routes
import type { OpenAPIHono } from '@hono/zod-openapi';
import {
  TrafficLightSchemas,
  LightRequestSchemas,
  VehicleSchemas,
  IntersectionSchemas,
} from '../schemas';
import {
  TrafficLightController,
  LightRequestController,
  VehicleController,
  IntersectionController,
} from '../controllers';

export const SetupMainTrafficRoutes = (app: OpenAPIHono) => {
  // ============================================
  // INTERSECTION ROUTES
  // ============================================

  app.openapi(
    IntersectionSchemas.getIntersectionRoute,
    IntersectionController.getIntersection
  );

  app.openapi(
    IntersectionSchemas.createIntersectionRoute,
    IntersectionController.createIntersection
  );

  app.openapi(
    IntersectionSchemas.updateIntersectionRoute,
    IntersectionController.updateIntersection
  );

  app.openapi(
    IntersectionSchemas.deleteIntersectionRoute,
    IntersectionController.deleteIntersection
  );

  app.openapi(
    IntersectionSchemas.listIntersectionsRoute,
    IntersectionController.listIntersections
  );

  app.openapi(
    IntersectionSchemas.listIntersectionsWithLightsRoute,
    IntersectionController.listIntersectionsWithLights
  );

  app.openapi(
    IntersectionSchemas.getNearbyIntersectionsRoute,
    IntersectionController.getNearbyIntersections
  );

  app.openapi(
    IntersectionSchemas.getIntersectionStatsRoute,
    IntersectionController.getIntersectionStats
  );

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

  // Intersection and nearby operations
  app.openapi(
    TrafficLightSchemas.getTrafficLightsByIntersectionRoute,
    TrafficLightController.getTrafficLightsByIntersection
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
