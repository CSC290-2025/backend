import { UnauthorizedError } from '@/errors';
import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyAccessToken } from '@/utils/jwt';

const authMiddleware: MiddlewareHandler = async (c, next) => {
  const accessToken = getCookie(c, 'accessToken');

  if (!accessToken) {
    throw new UnauthorizedError('Please login');
  }

  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    throw new UnauthorizedError('Invalid or expired access token');
  }

  c.set('user', payload);
  await next();
};

export { authMiddleware };
