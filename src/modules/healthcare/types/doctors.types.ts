import type { z } from 'zod';
import type { DoctorSchemas } from '../schemas';

type Doctor = z.infer<typeof DoctorSchemas.DoctorSchema>;
type CreateDoctorData = z.infer<typeof DoctorSchemas.CreateDoctorSchema>;
type UpdateDoctorData = z.infer<typeof DoctorSchemas.UpdateDoctorSchema>;
type DoctorFilterOptions = z.infer<typeof DoctorSchemas.DoctorFilterSchema>;
type DoctorPaginationOptions = z.infer<
  typeof DoctorSchemas.DoctorPaginationSchema
>;
type PaginatedDoctors = z.infer<typeof DoctorSchemas.PaginatedDoctorsSchema>;

export type {
  Doctor,
  CreateDoctorData,
  UpdateDoctorData,
  DoctorFilterOptions,
  DoctorPaginationOptions,
  PaginatedDoctors,
};
