import { EnrollmentModel } from '@/modules/Know_AI/models';
import type {
  EnrollmentOnsite,
  CreateEnrollment,
  EnrollmentOnsiteId,
} from '@/modules/Know_AI/types';

const createEnrollment = async (
  data: CreateEnrollment
): Promise<EnrollmentOnsite> => {
  return await EnrollmentModel.createEnrollment(data);
};

const getEnrollment = async (id: number): Promise<EnrollmentOnsite> => {
  return await EnrollmentModel.getEnrollment(id);
};

export { createEnrollment, getEnrollment };
