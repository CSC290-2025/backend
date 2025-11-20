import { ForbiddenError, UnauthorizedError } from '@/errors';
import type { MiddlewareHandler } from 'hono';
import type { AuthTypes } from '@/modules/Auth/types';
import { ROLES } from '@/constants/roles';

/**
 * Role-based access control middleware factory
 * @param allowedRoleNames - One or more role names that are allowed
 * @param message - Optional custom error message
 * @returns Middleware handler
 */
const requireRole = (
  allowedRoleNames: string | string[],
  message?: string
): MiddlewareHandler => {
  const roleNames = Array.isArray(allowedRoleNames)
    ? allowedRoleNames
    : [allowedRoleNames];

  return async (c, next) => {
    const user = c.get('user') as AuthTypes.JwtPayload | undefined;

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!user.role_name) {
      throw new ForbiddenError('User role not assigned');
    }

    if (!roleNames.includes(user.role_name)) {
      throw new ForbiddenError(
        message || `Access requires one of roles: ${roleNames.join(', ')}`
      );
    }

    await next();
  };
};

/**
 * Admin-only access middleware
 * just call the function instead of doing another [role]Middleware here, and exporting
 * this is an example
 */
const adminMiddleware = requireRole(ROLES.ADMIN, 'Admin access required');

export { adminMiddleware, requireRole };
