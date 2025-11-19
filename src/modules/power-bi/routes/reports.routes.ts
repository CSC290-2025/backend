// import { Hono } from 'hono';
// import type { MiddlewareHandler } from 'hono';
// import { ReportsController } from '../controllers';
// import { UnauthorizedError } from "@/errors";

// const reportRoutes = new Hono();

// // will use auth middleware later
// const requireAdmin: MiddlewareHandler = async (c, next) => {
//   const role =
//     c.req.header('x-user-role') ??
//     c.req.header('x-role') ??
//     c.req.query('role') ??
//     '';

//   if (role.toLowerCase() !== 'admin') {
//     return new UnauthorizedError('Admin role required for this action');
//   }

//   await next();
// };

// // Extract data by category
// reportRoutes.get('/all', ReportsController.getAllReports);
// reportRoutes.get('/', ReportsController.getReports);
// reportRoutes.post('/', requireAdmin, ReportsController.createReport);
// reportRoutes.put('/:id', requireAdmin, ReportsController.updateReport);
// reportRoutes.delete('/:id', requireAdmin, ReportsController.deleteReport);

// export { reportRoutes };
