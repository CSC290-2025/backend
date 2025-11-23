import type { z } from 'zod';
import type { PatientSchemas } from '../schemas';

type Patient = z.infer<typeof PatientSchemas.PatientSchema>;
type CreatePatientData = z.infer<typeof PatientSchemas.CreatePatientSchema>;
type UpdatePatientData = z.infer<typeof PatientSchemas.UpdatePatientSchema>;
type PatientFilterOptions = z.infer<typeof PatientSchemas.PatientFilterSchema>;
type PaginationOptions = z.infer<typeof PatientSchemas.PaginationSchema>;
type PaginatedPatients = z.infer<typeof PatientSchemas.PaginatedPatientsSchema>;

export type {
  Patient,
  CreatePatientData,
  UpdatePatientData,
  PatientFilterOptions,
  PaginationOptions,
  PaginatedPatients,
};
