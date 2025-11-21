import bcrypt from 'bcryptjs';
import {
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from '@/errors';
import config from '@/config/env';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/utils/jwt';

import { AuthModel } from '../models';
import type {
  LoginRequest,
  AuthTokens,
  JwtPayload,
  RefreshTokenRequest,
  RegisterRequest,
} from '../types/auth.types';

const login = async (data: LoginRequest): Promise<AuthTokens> => {
  const user = await AuthModel.findUserByEmail(data.email);

  if (!user) {
    throw new UnauthorizedError('Email is not registered');
  }

  const pass = await bcrypt.compare(data.password, user.password_hash);

  if (!pass) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role_name: user.roles?.role_name,
  };

  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  const expiresAtMs =
    Date.now() + parseInt(config.jwtRefreshExpiresIn) * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(expiresAtMs);

  await AuthModel.saveRefreshToken(user.id, refreshToken, expiresAt);
  await AuthModel.updateLastLogin(user.id);

  return {
    accessToken,
    refreshToken,
  };
};

const register = async (data: RegisterRequest): Promise<AuthTokens> => {
  const existingUser = await AuthModel.findUserByEmail(data.email);
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  const existingUsername = await AuthModel.findUserByUsername(data.username);
  if (existingUsername) {
    throw new ConflictError('Username already taken');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await AuthModel.createUser({
    email: data.email,
    username: data.username,
    password_hash: hashedPassword,
  });

  if (!user) {
    throw new ValidationError('Failed to create user, please try again');
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role_name: user.roles?.role_name,
  };

  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  const expiresAtMs =
    Date.now() + parseInt(config.jwtRefreshExpiresIn) * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(expiresAtMs);

  await AuthModel.saveRefreshToken(user.id, refreshToken, expiresAt);

  return {
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (
  data: RefreshTokenRequest
): Promise<AuthTokens> => {
  const decoded = await verifyRefreshToken(data.refreshToken);

  const payload = decoded as JwtPayload;

  if (!payload || !payload.userId) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const storedToken = await AuthModel.findRefreshToken(data.refreshToken);

  if (!storedToken) {
    throw new UnauthorizedError('Refresh token not found or expired');
  }

  const jwtPayload: JwtPayload = {
    userId: payload.userId,
    email: payload.email,
    username: payload.username,
    role_name: payload.role_name,
  };

  const newAccessToken = await generateAccessToken(jwtPayload);
  const newRefreshToken = await generateRefreshToken(jwtPayload);

  await AuthModel.revokeRefreshToken(storedToken.id);

  const expiresAtMs =
    Date.now() + parseInt(config.jwtRefreshExpiresIn) * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(expiresAtMs);
  await AuthModel.saveRefreshToken(
    jwtPayload.userId,
    newRefreshToken,
    expiresAt
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const logout = async (userId: number): Promise<void> => {
  await AuthModel.revokeAllUserTokens(userId);
};

const getCurrentUser = async (userId: number) => {
  const user = await AuthModel.findUserById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

export { login, refreshAccessToken, logout, getCurrentUser, register };
