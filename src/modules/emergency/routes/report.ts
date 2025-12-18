import { Hono } from 'hono';
import { ReportController } from '@/modules/emergency/controllers';

export function reportRoute() {
  const app = new Hono();

  app.get('/reports/:id', ReportController.findReportById);

  return app;
}
