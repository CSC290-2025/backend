import type { z } from 'zod';
import type { PrescriptionSchemas } from '../schemas';

type Prescription = z.infer<typeof PrescriptionSchemas.PrescriptionSchema>;
type CreatePrescriptionData = z.infer<
  typeof PrescriptionSchemas.CreatePrescriptionSchema
>;
type UpdatePrescriptionData = z.infer<
  typeof PrescriptionSchemas.UpdatePrescriptionSchema
>;
type PrescriptionFilterOptions = z.infer<
  typeof PrescriptionSchemas.PrescriptionFilterSchema
>;
type PrescriptionPaginationOptions = z.infer<
  typeof PrescriptionSchemas.PrescriptionPaginationSchema
>;
type PaginatedPrescriptions = z.infer<
  typeof PrescriptionSchemas.PaginatedPrescriptionsSchema
>;

export type {
  Prescription,
  CreatePrescriptionData,
  UpdatePrescriptionData,
  PrescriptionFilterOptions,
  PrescriptionPaginationOptions,
  PaginatedPrescriptions,
};
