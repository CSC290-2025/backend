import { Hono } from 'hono';
import { ReportController } from '@/modules/emergency/controllers';

const reportRoutes = new Hono();

reportRoutes.post('', ReportController.createReport);
reportRoutes.get('/:status', ReportController.findReportByStatus);

export { reportRoutes };
