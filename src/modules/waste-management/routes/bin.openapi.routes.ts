import type { OpenAPIHono } from '@hono/zod-openapi';
import { BinSchemas } from '../schemas';
import { BinController } from '../controllers';

const setupBinRoutes = (app: OpenAPIHono) => {
  // Get bin statistics (must come before /:id routes)
  app.openapi(BinSchemas.getBinStatsRoute, BinController.getBinStats);

  // Get nearest bins (must come before /:id routes)
  app.openapi(BinSchemas.getNearestBinsRoute, BinController.getNearestBins);

  // Get all bins with optional filters
  app.openapi(BinSchemas.getAllBinsRoute, BinController.getAllBins);

  // Create a new bin
  app.openapi(BinSchemas.createBinRoute, BinController.createBin);

  // Get bin by ID
  app.openapi(BinSchemas.getBinByIdRoute, BinController.getBinById);

  // Update bin
  app.openapi(BinSchemas.updateBinRoute, BinController.updateBin);

  // Delete bin
  app.openapi(BinSchemas.deleteBinRoute, BinController.deleteBin);

  // Update bin status
  app.openapi(BinSchemas.updateBinStatusRoute, BinController.updateBinStatus);

  // Record collection
  app.openapi(BinSchemas.recordCollectionRoute, BinController.recordCollection);
};

export { setupBinRoutes };
