import { Hono } from 'hono';
import { ReportController } from '@/modules/emergency/controllers';

const reportRoutes = new Hono();

reportRoutes.post('/', ReportController.createReport);

export { reportRoutes };
