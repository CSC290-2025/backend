import { ForbiddenError } from '@/errors';
import type { MiddlewareHandler } from 'hono';
import type { AuthTypes } from '@/modules/Auth/types';
import config from '@/config/env';

const ADMIN_ROLE_ID = config.adminRoleId;

const adminMiddleware: MiddlewareHandler = async (c, next) => {
  const user = c.get('user') as AuthTypes.JwtPayload;

  if (!user) {
    throw new ForbiddenError('User context not found');
  }

  if (user.roleId !== ADMIN_ROLE_ID) {
    throw new ForbiddenError('Admin access required');
  }

  await next();
};

export { adminMiddleware };
