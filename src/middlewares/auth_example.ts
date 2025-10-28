import { UnauthorizedError } from '@/errors';
import type { MiddlewareHandler } from 'hono';

const isAdmin: MiddlewareHandler = async (c, next) => {
  console.log('Checking for admin role...');
  const isAdminUser = c.req.query('admin') === 'true';

  if (!isAdminUser) {
    throw new UnauthorizedError('Admin access required');
  }

  await next();
};

const isUser: MiddlewareHandler = async (c, next) => {
  console.log('Checking for user role...');
  const isAuthUser = c.req.query('user') === 'true';

  if (!isAuthUser) {
    throw new UnauthorizedError('User login required');
  }

  await next();
};

export const AuthMiddleware = {
  isAdmin,
  isUser,
};
