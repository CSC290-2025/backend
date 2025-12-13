import type { OpenAPIHono } from '@hono/zod-openapi';
import { BinSchemas } from '../schemas';
import { BinController } from '../controllers';

const setupBinRoutes = (app: OpenAPIHono) => {
  // Get nearby bins with filters
  app.openapi(BinSchemas.getNearbyBinsRoute, BinController.getNearbyBins);

  // Get all bins with optional filters
  app.openapi(BinSchemas.getAllBinsRoute, BinController.getAllBins);

  // Create a new bin
  app.openapi(BinSchemas.createBinRoute, BinController.createBin);

  // Get bin by ID
  app.openapi(BinSchemas.getBinByIdRoute, BinController.getBinById);

  // Delete bin
  app.openapi(BinSchemas.deleteBinRoute, BinController.deleteBin);
};

export { setupBinRoutes };
