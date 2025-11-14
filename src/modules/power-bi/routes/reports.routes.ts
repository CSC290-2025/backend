import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { ReportsController } from '../controllers';

const reportRoutes = new Hono();

const requireAdmin: MiddlewareHandler = async (c, next) => {
  const role =
    c.req.header('x-user-role') ??
    c.req.header('x-role') ??
    c.req.query('role') ??
    '';

  if (role.toLowerCase() !== 'admin') {
    return c.json({ error: 'Admin role required for this action' }, 403);
  }

  await next();
};

// Extract data by category
reportRoutes.get('/all', ReportsController.getAllReports);
reportRoutes.get('/', ReportsController.getReports);
reportRoutes.post('/', requireAdmin, ReportsController.createReport);
reportRoutes.put('/:id', requireAdmin, ReportsController.updateReport);
reportRoutes.delete('/:id', requireAdmin, ReportsController.deleteReport);

export { reportRoutes };
