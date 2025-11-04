import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ReportsController } from '../controllers';

const reportsRoutes = new Hono();

// Allow frontend dev origin
reportsRoutes.use('*', cors({ origin: '*' }));

// Reports (Power BI) - Get reports organized by category, filtered by role
reportsRoutes.get('/reports', ReportsController.getReports);
reportsRoutes.post('/reports', ReportsController.createReport);

export { reportsRoutes };
