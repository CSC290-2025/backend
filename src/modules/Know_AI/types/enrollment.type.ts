import type * as z from 'zod';
import type { EnrollmentSchema } from '@/modules/Know_AI/schemas';

type EnrollmentOnsite = z.infer<typeof EnrollmentSchema.enrollmentOnsite>;
type EnrollmentOnsiteId = z.infer<typeof EnrollmentSchema.enrollmentOnsiteId>;
type CreateEnrollment = z.infer<typeof EnrollmentSchema.createEnrollmentOnsite>;

export type { EnrollmentOnsite, CreateEnrollment, EnrollmentOnsiteId };
