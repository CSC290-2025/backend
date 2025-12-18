import { z } from 'zod';
import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers';
import { authMiddleware, optionalAuthMiddleware } from '@/middlewares';

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const RegisterRequestSchema = z.object({
  //users Table
  email: z.email('Invalid email address').min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  username: z
    .string()
    .min(1, 'Username is required')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),

  //userProfile table
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  dob: z.coerce.date(),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female']),

  addressLine: z.string().optional(),
  subDistrict: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
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

export const LoginStatusResponseSchema = z.object({
  authenticated: z.boolean(),
  userId: z.number(),
});

export const loginRoute = createPostRoute({
  path: '/auth/login',
  summary: 'User login',
  requestSchema: LoginRequestSchema,
  responseSchema: AuthResponseSchema,
  tags: ['Authentication'],
  middleware: [optionalAuthMiddleware],
});

export const registerRoute = createPostRoute({
  path: '/auth/register',
  summary: 'User registration',
  requestSchema: RegisterRequestSchema,
  responseSchema: AuthResponseSchema,
  tags: ['Authentication'],
  middleware: [optionalAuthMiddleware],
});

export const refreshTokenRoute = createPostRoute({
  path: '/auth/refresh',
  summary: 'Refresh access token',
  requestSchema: z.object({}),
  responseSchema: AuthResponseSchema,
  tags: ['Authentication'],
});

export const logoutRoute = createPostRoute({
  path: '/auth/logout',
  summary: 'User logout',
  requestSchema: z.object({}),
  responseSchema: z.object({}),
  tags: ['Authentication'],
  middleware: [authMiddleware],
});

export const meRoute = createGetRoute({
  path: '/auth/me',
  summary: 'Check login status',
  responseSchema: LoginStatusResponseSchema,
  tags: ['Authentication'],
  middleware: [authMiddleware],
});
