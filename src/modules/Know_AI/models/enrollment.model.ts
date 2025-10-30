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
    return await prisma.knowAI_enrollment.create({
      data,
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

const getEnrollment = async (id: number): Promise<EnrollmentOnsite> => {
  try {
    return await prisma.knowAI_enrollment.findUnique({
      where: {
        id,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { createEnrollment, getEnrollment };
