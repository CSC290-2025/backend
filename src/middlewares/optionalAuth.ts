import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyAccessToken } from '@/utils/jwt';

// just for login/register, so that one can't spam
const optionalAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const accessToken = getCookie(c, 'accessToken');

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) {
      c.set('user', payload);
    }
  }

  await next();
};

export { optionalAuthMiddleware };
