import { UnauthorizedError } from '@/errors';
import type { Context, MiddlewareHandler } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { verifyAccessToken } from '@/utils/jwt';
import { AuthService } from '@/modules/Auth/services';
import config from '@/config/env';

const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';
const DAYS = Number(config.jwtRefreshExpiresIn);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'Strict' as const,
  path: '/',
};

const setAuthCookies = (
  c: Context,
  tokens: { accessToken: string; refreshToken: string }
) => {
  setCookie(c, ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60,
  });

  setCookie(c, REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: DAYS * 24 * 60 * 60,
  });
};

const authMiddleware: MiddlewareHandler = async (c: Context, next) => {
  const accessToken = getCookie(c, ACCESS_TOKEN_COOKIE);
  const refreshToken = getCookie(c, REFRESH_TOKEN_COOKIE);

  if (!refreshToken) {
    throw new UnauthorizedError('Please login');
  }

  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);

      c.set('user', payload);
      await next();

      return;
    } catch (_error) {}
  }

  try {
    const tokens = await AuthService.refreshAccessToken({
      refreshToken,
    });

    setAuthCookies(c, tokens);

    const payload = await verifyAccessToken(tokens.accessToken);

    c.set('user', payload);
    await next();
  } catch {
    throw new UnauthorizedError('Please login');
  }
};
export { authMiddleware };
