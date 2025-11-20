import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';

const findSpecialtyById = async (specialty_id: number) => {
  try {
    const specialty = await prisma.specialty.findUnique({
      where: {
        id: specialty_id,
      },
    });
    return specialty;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { findSpecialtyById };
