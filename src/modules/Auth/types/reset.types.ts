import type { z } from 'zod';
import type {
  passwordResetRequestSchema,
  passwordResetResponseSchema,
  VerificationTokenRequestSchema,
  TokenResponseSchema,
} from '../schemas/reset.schemas';

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetResponse = z.infer<typeof passwordResetResponseSchema>;
export type VerificationTokenRequest = z.infer<
  typeof VerificationTokenRequestSchema
>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
