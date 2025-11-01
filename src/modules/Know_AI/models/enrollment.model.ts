import prisma from '@/config/client.ts';
import { handlePrismaError } from '@/errors';
import type {
  EnrollmentOnsite,
  CreateEnrollment,
  EnrollmentOnsiteId,
} from '@/modules/Know_AI/types';

const createEnrollment = async (
  data: CreateEnrollment
): Promise<EnrollmentOnsite> => {
  try {
    return await prisma.onsite_enrollments.create({
      data,
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const getEnrollment = async (id: number): Promise<EnrollmentOnsite> => {
  try {
    const enrollment = await prisma.onsite_enrollments.findUnique({
      where: {
        id,
      },
    });

    if (!enrollment) {
      throw new Error(`Enrollment with id ${id} not found`);
    }

    return enrollment;
  } catch (error) {
    handlePrismaError(error);
  }
};

export { createEnrollment, getEnrollment };
