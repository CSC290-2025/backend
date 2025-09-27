// The key point is just showing how Prisma handles DB-related errors automatically

import { UserModel } from '@/models';
import type {
  User,
  CreateUserData,
  UpdateUserData,
  UserQueryParams,
  PaginatedUsers,
} from '@/types';
import { NotFoundError, ValidationError } from '@/errors';

const getUserById = async (id: string): Promise<User> => {
  const user = await UserModel.findById(id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

const getAllUsers = async (
  params: UserQueryParams = {}
): Promise<PaginatedUsers> => {
  return await UserModel.findAll(params);
};

const createUser = async (data: CreateUserData): Promise<User> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new ValidationError('Invalid email format');
  }

  if (!data.name || data.name.trim().length < 2) {
    throw new ValidationError('Name must be at least 2 characters long');
  }

  // Create user - Prisma will handle unique constraint violations
  // which will be converted to ConflictError by handlePrismaError
  return await UserModel.create({
    ...data,
    name: data.name.trim(),
  });
};

const updateUser = async (id: string, data: UpdateUserData): Promise<User> => {
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters long');
    }
    data.name = data.name.trim();
  }

  // Update user - Prisma will handle not found and unique constraint violations
  // which will be converted to appropriate errors by handlePrismaError (either not found or alrdy exists)
  const updatedUser = await UserModel.update(id, data);

  if (!updatedUser) {
    throw new NotFoundError('User not found');
  }

  return updatedUser;
};

const deleteUser = async (id: string): Promise<void> => {
  // Delete user - Prisma will handle not found errors
  // which will be converted to NotFoundError by handlePrismaError
  await UserModel.deleteUser(id);
};

const searchUsers = async (
  query: string,
  params: UserQueryParams = {}
): Promise<PaginatedUsers> => {
  return await UserModel.findAll({
    ...params,
    search: query,
  });
};

const getUserByEmail = async (email: string): Promise<User> => {
  const user = await UserModel.findByEmail(email);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

const validateUserExists = async (id: string): Promise<boolean> => {
  return await UserModel.exists(id);
};

export {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUserByEmail,
  validateUserExists,
};
