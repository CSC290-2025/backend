import type { Context } from 'hono';
import {
  hashedPassword,
  requestPasswordReset,
  verifyTokenService,
} from '../services/reset.service';
import { successResponse } from '@/utils/response';
import { NotFoundError } from '@/errors';
import { findResetToken } from '../models/reset.model';

const forgetPassword = async (c: Context) => {
  const { email } = await c.req.json();

  await requestPasswordReset({ email });

  return successResponse(c, {}, 200, 'If that email exists, we sent a link.');
};

const verifyToken = async (c: Context) => {
  const { token } = c.req.query();
  const isValid = await verifyTokenService(token);

  if (!isValid) {
    throw new NotFoundError('Link is invalid or expired');
  }

  return successResponse(c, { message: 'Valid' }, 200, 'Valid');
};

const changePassword = async (c: Context) => {
  const { token, newPassword } = await c.req.json();
  const isValid = await verifyTokenService(token);

  if (!isValid) {
    throw new NotFoundError('Link is invalid or expired');
  }

  const verification_token = await findResetToken(token);
  if (!verification_token) {
    throw new NotFoundError('Invalid Token');
  }
  const userId = verification_token.user_id;
  if (!userId) {
    throw new NotFoundError('Token is not linked to any user');
  }
  await hashedPassword(userId, newPassword);

  return successResponse(
    c,
    { message: 'Password changed successfully' },
    200,
    'Password changed successfully'
  );
};
export { forgetPassword, verifyToken, changePassword };
