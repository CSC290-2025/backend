import { sign, verify } from 'hono/jwt';
import config from '@/config/env';
import type { AuthTypes } from '@/modules/Auth/types';
import { UnauthorizedError } from '@/errors';

const generateAccessToken = (
  payload: AuthTypes.JwtPayload
): Promise<string> => {
  const exp = Math.floor(Date.now() / 1000) + 15 * 60;
  return sign({ ...payload, type: 'access', exp }, config.jwtSecret);
};

const generateRefreshToken = (
  payload: AuthTypes.JwtPayload
): Promise<string> => {
  const days = Number(config.jwtRefreshExpiresIn);
  const exp = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
  return sign({ ...payload, type: 'refresh', exp }, config.jwtRefreshSecret);
};

const verifyRefreshToken = async (
  token: string
): Promise<AuthTypes.JwtPayload> => {
  try {
    const payload = await verify(token, config.jwtRefreshSecret);

    if (!payload || payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid refresh token');
    }

    return payload as unknown as AuthTypes.JwtPayload;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};

const verifyAccessToken = async (
  token: string
): Promise<AuthTypes.JwtPayload | null> => {
  const payload = await verify(token, config.jwtSecret);

  if (!payload || payload.type !== 'access') {
    throw new UnauthorizedError('Invalid access token');
  }

  return payload as unknown as AuthTypes.JwtPayload;
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
