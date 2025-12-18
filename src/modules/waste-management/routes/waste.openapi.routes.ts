import type { OpenAPIHono } from '@hono/zod-openapi';
import { WasteSchemas } from '../schemas';
import { WasteController } from '../controllers';

const setupWasteRoutes = (app: OpenAPIHono) => {
  // Get all waste types
  app.openapi(WasteSchemas.getWasteTypesRoute, WasteController.getWasteTypes);

  // Log waste collection
  app.openapi(WasteSchemas.logWasteRoute, WasteController.logWaste);

  // Get monthly statistics
  app.openapi(WasteSchemas.getStatsRoute, WasteController.getWasteStats);

  // Get daily statistics
  app.openapi(WasteSchemas.getDailyStatsRoute, WasteController.getDailyStats);

  // Delete waste log
  app.openapi(WasteSchemas.deleteLogRoute, WasteController.deleteLogById);
};

export { setupWasteRoutes };
