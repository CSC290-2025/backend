import { Resend } from 'resend';
import { saveResetToken } from '../models/reset.model';
import { findUserByEmail } from '../models/auth.model';
import { v4 as uuidv4 } from 'uuid';
import { findResetToken } from '../models/reset.model';
import { UnauthorizedError } from '@/errors';
import type {
  PasswordResetRequest,
  PasswordResetResponse,
} from '../types/reset.types';
import { changeUserPassword } from '../models/reset.model';
import bcrypt from 'bcryptjs';

export const requestPasswordReset = async (
  data: PasswordResetRequest
): Promise<PasswordResetResponse> => {
  const resend = new Resend(process.env.SYSTEM_RESEND_API_KEY);
  const user = await findUserByEmail(data.email);
  if (!user) throw new UnauthorizedError('User not found');
  const userId = user.id;

  const tokenString = uuidv4();
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  await saveResetToken(userId, tokenString, expiresAt);

  const link = `http://localhost:3000/reset-password?token=${tokenString}`;

  await resend.emails.send({
    from: 'Integrated Project I <noreply@integrated.ttwrpz.xyz>',
    to: data.email,
    subject: 'Reset Password 💀6️⃣7️⃣',
    html: `<a href="${link}">Click here to reset</a>`,
  });

  return { success: true };
};
export const verifyTokenService = async (token: string) => {
  const record = await findResetToken(token);

  if (!record || !record.expires_at) return false;

  if (new Date() > record.expires_at) return false;

  return true;
};

export const hashedPassword = async (userId: number, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await changeUserPassword(userId, hashedPassword);
};
