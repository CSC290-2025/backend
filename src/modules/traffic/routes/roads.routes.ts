import type { OpenAPIHono } from '@hono/zod-openapi';
import { RoadSchemas } from '../schemas';
import { RoadController } from '../controllers';

export const setupRoadRoutes = (app: OpenAPIHono) => {
  // Public routes
  app.openapi(
    RoadSchemas.getRoadsByIntersectionRoute,
    RoadController.getRoadsByIntersection
  );
  app.openapi(RoadSchemas.getRoadStatsRoute, RoadController.getRoadStats);

  // User routes
  app.openapi(RoadSchemas.listRoadsRoute, RoadController.listRoads);
  app.openapi(RoadSchemas.getRoadRoute, RoadController.getRoad);

  // Admin routes
  app.openapi(RoadSchemas.adminCreateRoadRoute, RoadController.createRoad);
  app.openapi(RoadSchemas.adminUpdateRoadRoute, RoadController.updateRoad);
  app.openapi(RoadSchemas.adminDeleteRoadRoute, RoadController.deleteRoad);
};
