import { OpenAPIHono } from '@hono/zod-openapi';
import * as StaffController from '../controllers/staff.controller';
import { StaffSchemas } from '../schemas/staff.schemas';
import { adminMiddleware, authMiddleware } from '@/middlewares';

export const setupStaffRoutes = (app: OpenAPIHono) => {
  const protectedRoutes = new OpenAPIHono();

  // Protect all staff management routes
  protectedRoutes.use(
    '/api/healthcare/staff/*',
    authMiddleware,
    adminMiddleware
  );

  protectedRoutes.openapi(
    StaffSchemas.listStaffRoute,
    StaffController.getAllStaff
  );
  protectedRoutes.openapi(
    StaffSchemas.updateStaffRoute,
    StaffController.updateStaff
  );
  protectedRoutes.openapi(
    StaffSchemas.deleteStaffRoute,
    StaffController.deleteStaff
  );

  app.route('/', protectedRoutes);
};
