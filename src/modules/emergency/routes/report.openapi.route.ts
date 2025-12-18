import { ReportController } from '@/modules/emergency/controllers';
import { RouteSchemas } from '@/modules/emergency/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupReportRoutes = (app: OpenAPIHono) => {
  app.openapi(
    RouteSchemas.Report.createReportRoute,
    ReportController.createReport
  );
  app.openapi(
    RouteSchemas.Report.findReportByStatusRoute,
    ReportController.findReportByStatus
  );
  app.openapi(
    RouteSchemas.Report.updateReportByIdRoute,
    ReportController.updateReportById
  );
  app.openapi(
    RouteSchemas.Report.deleteReportByIdRoute,
    ReportController.deleteReportById
  );
  app.openapi(
    RouteSchemas.Report.findReportByIdRoute,
    ReportController.findReportById
  );
};

export { setupReportRoutes };
