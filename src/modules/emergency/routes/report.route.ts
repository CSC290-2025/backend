import { ReportController } from '@/modules/emergency/controllers';
import { Hono } from 'hono';

const reportRoutes = new Hono();

reportRoutes.post('/', ReportController.createReport);

export { reportRoutes };
