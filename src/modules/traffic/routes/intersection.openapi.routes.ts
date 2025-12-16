import type { OpenAPIHono } from '@hono/zod-openapi';
import { IntersectionSchemas } from '../schemas';
import { IntersectionController } from '../controllers';

export const setupIntersectionRoutes = (app: OpenAPIHono) => {
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
};
