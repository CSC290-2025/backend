import { ReportController } from '@/modules/emergency/controllers';
import { RouteSchemas } from '@/modules/emergency/schemas';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupReportRoutes = (app: OpenAPIHono) => {
  app.openapi(
    RouteSchemas.Report.createReportRoute,
    ReportController.createReport
  );
};

export { setupReportRoutes };
