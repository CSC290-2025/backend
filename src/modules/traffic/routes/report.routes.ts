import type { OpenAPIHono } from '@hono/zod-openapi';
import * as TrafficReportController from '../controllers/report.controller';

const setupLightReportRoutes = (app: OpenAPIHono) => {
  app.get('/traffic/report', TrafficReportController.getTrafficReport);
};

export { setupLightReportRoutes };
