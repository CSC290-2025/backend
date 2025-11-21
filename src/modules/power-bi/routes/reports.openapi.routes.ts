import type { OpenAPIHono } from '@hono/zod-openapi';
import { ReportsSchemas } from '../schemas';
import { ReportsController } from '../controllers';
import { adminMiddleware, authMiddleware } from '@/middlewares';

const setupReportsRoutes = (app: OpenAPIHono) => {
  // Public routes
  // app.use(authMiddleware);
  app.openapi(
    ReportsSchemas.getAllReportsRoute,
    ReportsController.getAllReports
  );
  app.openapi(
    ReportsSchemas.getReportsByRoleRoute,
    ReportsController.getReports
  );

  // Admin routes
  // app.use(adminMiddleware);
  app.openapi(ReportsSchemas.createReportRoute, ReportsController.createReport);
  app.openapi(ReportsSchemas.updateReportRoute, ReportsController.updateReport);
  app.openapi(ReportsSchemas.deleteReportRoute, ReportsController.deleteReport);
};

export { setupReportsRoutes };
