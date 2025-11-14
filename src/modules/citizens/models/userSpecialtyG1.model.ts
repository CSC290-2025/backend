import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { CreateUserSpecialty } from '../types';

const createUserSpecialty = async (data: CreateUserSpecialty) => {
  try {
    const user = await prisma.users_specialty.create({
      data: data,
    });
    return user;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { createUserSpecialty };
