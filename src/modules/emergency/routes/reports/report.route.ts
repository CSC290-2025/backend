import { Hono } from 'hono';
import { ReportController } from '@/modules/emergency/controllers';

export function reportRoutes() {
  const app = new Hono();

  app.post('/reports', ReportController.createReport);
  app.get('/reports/:status', ReportController.findReportByStatus);

  return app;
}
