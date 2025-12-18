import { OpenAPIHono } from '@hono/zod-openapi';
import * as StaffController from '../controllers/staff.controller';
import { StaffSchemas } from '../schemas/staff.schemas';
import { jwt } from 'hono/jwt';

const SECRET_KEY = process.env.JWT_SECRET || 'healthcare-secret-key-change-me';

export const setupStaffRoutes = (app: OpenAPIHono) => {
  const protectedRoutes = new OpenAPIHono();

  // Protect all staff management routes
  protectedRoutes.use('/api/healthcare/staff/*', jwt({ secret: SECRET_KEY }));

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
