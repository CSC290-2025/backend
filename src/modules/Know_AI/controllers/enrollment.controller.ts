import type { Context } from 'hono';
import { EnrollmentService } from '@/modules/Know_AI/services';
import { successResponse } from '@/utils/response.ts';

const createEnrollment = async (c: Context) => {
  const body = await c.req.json();
  const report = await EnrollmentService.createEnrollment(body);
  return successResponse(c, { report }, 201, 'Create reports successfully');
};

const getEnrollment = async (c: Context) => {
  const enrollmentId = Number(c.req.param('enrollmentId'));
  const enrollment = await EnrollmentService.getEnrollment(enrollmentId);
  return successResponse(c, { enrollment });
};

export { createEnrollment, getEnrollment };
