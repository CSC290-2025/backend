import type { z } from 'zod';
import type { AmbulanceSchemas } from '../schemas';

type Ambulance = z.infer<typeof AmbulanceSchemas.AmbulanceSchema>;
type CreateAmbulanceData = z.infer<
  typeof AmbulanceSchemas.CreateAmbulanceSchema
>;
type UpdateAmbulanceData = z.infer<
  typeof AmbulanceSchemas.UpdateAmbulanceSchema
>;
type AmbulanceFilterOptions = z.infer<
  typeof AmbulanceSchemas.AmbulanceFilterSchema
>;
type AmbulancePaginationOptions = z.infer<
  typeof AmbulanceSchemas.AmbulancePaginationSchema
>;
type PaginatedAmbulances = z.infer<
  typeof AmbulanceSchemas.PaginatedAmbulancesSchema
>;

export type {
  Ambulance,
  CreateAmbulanceData,
  UpdateAmbulanceData,
  AmbulanceFilterOptions,
  AmbulancePaginationOptions,
  PaginatedAmbulances,
};
