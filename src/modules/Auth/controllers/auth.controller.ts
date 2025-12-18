import type { Context } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { successResponse } from '@/utils/response';
import { AuthService } from '../services';
import type { AuthTypes } from '../types';
import config from '@/config/env';
import { UnauthorizedError, ConflictError } from '@/errors';
import { RegisterRequestSchema } from '../schemas/auth.schemas';

// now implemented in auth middleware
// keeping it just in case of manual retrieval to /refresh endpoint
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

const login = async (c: Context) => {
  const existingUser = c.get('user');
  if (existingUser) {
    throw new ConflictError('You are already logged in');
  }

  const body: AuthTypes.LoginRequest = await c.req.json();
  const tokens = await AuthService.login(body);

  setAuthCookies(c, tokens);

  return successResponse(c, {}, 200, 'Login successful');
};

const register = async (c: Context) => {
  const existingUser = c.get('user');
  if (existingUser) {
    throw new ConflictError('You are already logged in. Please logout first');
  }
  const rawBody = await c.req.json();
  const body = await RegisterRequestSchema.parseAsync(rawBody);
  const tokens = await AuthService.register(body);

  setAuthCookies(c, tokens);

  return successResponse(c, {}, 201, 'Registration successful');
};

const refreshToken = async (c: Context) => {
  const refreshTokenValue = getCookie(c, REFRESH_TOKEN_COOKIE);

  if (!refreshTokenValue) {
    throw new UnauthorizedError(
      'Refresh token missing or expired - please login again'
    );
  }

  const tokens = await AuthService.refreshAccessToken({
    refreshToken: refreshTokenValue,
  });

  setAuthCookies(c, tokens);

  return successResponse(c, {}, 200, 'Token refreshed successfully');
};

const logout = async (c: Context) => {
  const user = c.get('user') as AuthTypes.JwtPayload;

  await AuthService.logout(user.userId);

  deleteCookie(c, ACCESS_TOKEN_COOKIE, { path: '/' });
  deleteCookie(c, REFRESH_TOKEN_COOKIE, { path: '/' });

  return successResponse(c, {}, 200, 'Logout successful');
};

const me = async (c: Context) => {
  const user = c.get('user') as AuthTypes.JwtPayload;

  return successResponse(
    c,
    { authenticated: true, userId: user.userId, role: user.role_name },
    200
  );
};

export { login, refreshToken, logout, me, register };
