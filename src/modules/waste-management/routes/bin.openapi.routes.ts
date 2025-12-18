import type { OpenAPIHono } from '@hono/zod-openapi';
import { BinSchemas } from '../schemas';
import { BinController } from '../controllers';
import { optionalAuthMiddleware } from '@/middlewares/optionalAuth';
import { authMiddleware } from '@/middlewares/auth';

const setupBinRoutes = (app: OpenAPIHono) => {
  app.openapi(BinSchemas.getNearbyBinsRoute, BinController.getNearbyBins);

  app.openapi(BinSchemas.getAllBinsRoute, BinController.getAllBins);

  app.openapi(BinSchemas.getBinsByUserRoute, async (c) => {
    await authMiddleware(c, async () => {});
    return BinController.getBinsByUser(c);
  });

  app.openapi(BinSchemas.createBinRoute, async (c) => {
    await optionalAuthMiddleware(c, async () => {});
    return BinController.createBin(c);
  });

  app.openapi(BinSchemas.getBinByIdRoute, BinController.getBinById);

  app.openapi(BinSchemas.deleteBinRoute, async (c) => {
    await authMiddleware(c, async () => {});
    return BinController.deleteBin(c);
  });
};

export { setupBinRoutes };
