import { Hono } from 'hono';
import { ReportsController } from '../controllers';

const reportRoutes = new Hono();

// Extract data by category
reportRoutes.get('/all', ReportsController.getAllReports);
reportRoutes.get('/', ReportsController.getReports);
reportRoutes.post('/', ReportsController.createReport);
reportRoutes.put('/:id', ReportsController.updateReport);
reportRoutes.delete('/:id', ReportsController.deleteReport);

export { reportRoutes };
