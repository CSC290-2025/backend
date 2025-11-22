import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { Prisma } from '@prisma/client/scripts/default-index';
import { WalletModel } from '@/modules/Financial';
import type { CreateWalletData } from '@/modules/Financial/types';

const findUserById = async (userId: number) => {
  try {
    return await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role_id: true,
        created_at: true,
        last_login: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const findUserByEmail = async (email: string) => {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password_hash: true,
        roles: {
          select: {
            role_name: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    handlePrismaError(error);
  }
};

const findUserByUsername = async (username: string) => {
  try {
    return await prisma.users.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password_hash: true,
        role_id: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const saveRefreshToken = async (
  userId: number,
  refreshToken: string,
  expiresAt: Date
) => {
  try {
    return await prisma.refresh_tokens.create({
      data: {
        user_id: userId,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const findRefreshToken = async (refreshToken: string) => {
  try {
    return await prisma.refresh_tokens.findFirst({
      where: {
        refresh_token: refreshToken,
        expires_at: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        user_id: true,
        expires_at: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const revokeRefreshToken = async (refreshTokenId: number) => {
  try {
    return await prisma.refresh_tokens.delete({
      where: { id: refreshTokenId },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const revokeAllUserTokens = async (userId: number) => {
  try {
    return await prisma.refresh_tokens.deleteMany({
      where: { user_id: userId },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateLastLogin = async (userId: number) => {
  try {
    return await prisma.users.update({
      where: { id: userId },
      data: { last_login: new Date() },
      select: {
        id: true,
        last_login: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const createUser = async (
  data: {
    email: string;
    username: string;
    password_hash: string;
    phone?: string;
  },
  tx?: Prisma.TransactionClient // required to make the create user part of a transaction to make it atomic
) => {
  try {
    return await (tx ?? prisma).users.create({
      data: {
        email: data.email,
        username: data.username,
        password_hash: data.password_hash,
        phone: data.phone,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        roles: {
          select: {
            role_name: true,
          },
        },
        created_at: true,
        last_login: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const registerUser = async (data: {
  email: string;
  username: string;
  password_hash: string;
}) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const newUser = await createUser(data, tx);
      if (!newUser) {
        throw new Error('Failed to create user');
      }
      const wallet = await WalletModel.createWallet(
        newUser.id,
        { user_id: newUser.id, wallet_type: 'individual' } as CreateWalletData,
        tx
      );
      if (!wallet) {
        throw new Error('Failed to create wallet');
      }
      return newUser;
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export {
  findUserById,
  findUserByEmail,
  findUserByUsername,
  saveRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  updateLastLogin,
  createUser,
  registerUser,
};
