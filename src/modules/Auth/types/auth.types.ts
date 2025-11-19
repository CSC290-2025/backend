import type { z } from 'zod';
import type {
  LoginRequestSchema,
  RegisterRequestSchema,
  RefreshTokenRequestSchema,
  TokenResponseSchema,
  AuthResponseSchema,
} from '../schemas/auth.schemas';

export interface JwtPayload {
  userId: number;
  email: string;
  username: string;
  roleId?: number;
  iat?: number;
  exp?: number;
  type?: 'access' | 'refresh';
}

export type AuthTokens = z.infer<typeof TokenResponseSchema>;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
