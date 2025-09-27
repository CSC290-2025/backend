// let's just assume we have a user table in prisma, don't mind the error msg
// this is just demonstration

import type {
  User,
  CreateUserData,
  UpdateUserData,
  UserQueryParams,
  PaginatedUsers,
} from '@/types';
import { handlePrismaError } from '@/errors';
import prisma from '@/config/client';

const findById = async (id: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const findByEmail = async (email: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const findAll = async (
  params: UserQueryParams = {}
): Promise<PaginatedUsers> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const orderBy = { [sortBy]: sortOrder };

    // Get users and total count in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const create = async (data: CreateUserData): Promise<User> => {
  try {
    return await prisma.user.create({
      data,
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const update = async (
  id: string,
  data: UpdateUserData
): Promise<User | null> => {
  try {
    return await prisma.user.update({
      where: { id },
      data,
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await prisma.user.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    handlePrismaError(error);
  }
};

const exists = async (id: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  } catch (error) {
    handlePrismaError(error);
  }
};

const emailExists = async (email: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findById,
  findByEmail,
  findAll,
  create,
  update,
  deleteUser,
  exists,
  emailExists,
};
