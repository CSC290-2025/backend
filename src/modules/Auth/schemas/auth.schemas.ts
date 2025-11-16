import { z } from 'zod';
import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers';
import { authMiddleware } from '@/middlewares/auth';

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const RegisterRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  username: z.string().min(3),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const UserResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
  role_id: z.number().nullable(),
  created_at: z.iso.datetime(),
  last_login: z.iso.datetime().nullable(),
});

export const AuthResponseSchema = z.object({});

export const MeResponseSchema = z.object({
  user: UserResponseSchema,
});

export const loginRoute = createPostRoute({
  path: '/auth/login',
  summary: 'User login',
  requestSchema: LoginRequestSchema,
  responseSchema: AuthResponseSchema,
  tags: ['Authentication'],
});

export const registerRoute = createPostRoute({
  path: '/auth/register',
  summary: 'User registration',
  requestSchema: RegisterRequestSchema,
  responseSchema: AuthResponseSchema,
  tags: ['Authentication'],
});

export const refreshTokenRoute = createPostRoute({
  path: '/auth/refresh',
  summary: 'Refresh access token',
  requestSchema: RefreshTokenRequestSchema,
  responseSchema: AuthResponseSchema,
  tags: ['Authentication'],
});

export const logoutRoute = createPostRoute({
  path: '/auth/logout',
  summary: 'User logout',
  requestSchema: z.object({}),
  responseSchema: z.object({}),
  tags: ['Authentication'],
});

export const meRoute = createGetRoute({
  path: '/auth/me',
  summary: 'Get current user',
  responseSchema: MeResponseSchema,
  tags: ['Authentication'],
  middleware: [authMiddleware],
});
