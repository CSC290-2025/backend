import type { OpenAPIHono } from '@hono/zod-openapi';
import { ReportsSchemas } from '../schemas';
import { ReportsController } from '../controllers';

const setupReportsRoutes = (app: OpenAPIHono) => {
  // Public routes
  app.openapi(
    ReportsSchemas.getAllReportsRoute,
    ReportsController.getAllReports
  );
  app.openapi(
    ReportsSchemas.getReportsByRoleRoute,
    ReportsController.getReports
  );

  // Admin routes
  app.openapi(ReportsSchemas.createReportRoute, ReportsController.createReport);
  app.openapi(ReportsSchemas.updateReportRoute, ReportsController.updateReport);
  app.openapi(ReportsSchemas.deleteReportRoute, ReportsController.deleteReport);
};

export { setupReportsRoutes };
