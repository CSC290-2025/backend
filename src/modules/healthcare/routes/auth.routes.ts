import { OpenAPIHono } from '@hono/zod-openapi';
import * as AuthController from '../controllers/auth.controller';
import { AuthSchemas } from '../schemas/auth.schemas';
import { jwt } from 'hono/jwt';

const SECRET_KEY = process.env.JWT_SECRET || 'healthcare-secret-key-change-me';

export const setupAuthRoutes = (app: OpenAPIHono) => {
  // Login Route
  app.openapi(AuthSchemas.loginRoute, AuthController.login);

  // Add Staff Route - Protected
  // We apply JWT middleware specifically to this route or group
  const protectedRoutes = new OpenAPIHono();

  protectedRoutes.use('/api/healthcare/auth/*', jwt({ secret: SECRET_KEY }));

  protectedRoutes.openapi(AuthSchemas.addStaffRoute, AuthController.addStaff);

  app.route('/', protectedRoutes);
};
