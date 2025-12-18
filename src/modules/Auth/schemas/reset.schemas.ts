import { authMiddleware } from '@/middlewares';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
} from '@/utils/openapi-helpers';
import { z } from 'zod';

export const passwordResetRequestSchema = z.object({
  email: z.string(),
});

export const passwordResetResponseSchema = z.object({
  success: z.boolean(),
});

export const VerificationTokenRequestSchema = z.object({
  token: z.string().min(1),
});

export const TokenResponseSchema = z.object({
  token: z.string(),
});

export const changePasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePassword = createPutRoute({
  path: '/auth/change-password',
  summary: 'Change user password',
  requestSchema: changePasswordSchema,
  responseSchema: z.object({}),
  tags: ['PasswordReset'],
});

export const forgetPasswordRoute = createPostRoute({
  path: '/auth/forget_password',
  summary: 'User Password Reset',
  requestSchema: passwordResetRequestSchema,
  responseSchema: passwordResetResponseSchema,
  tags: ['PasswordReset'],
});

export const verifyTokenRoute = createGetRoute({
  path: '/auth/verify-token',
  summary: 'Verify a token',
  query: VerificationTokenRequestSchema,
  responseSchema: TokenResponseSchema,
  tags: ['PasswordReset'],
});
