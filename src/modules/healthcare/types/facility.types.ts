import type { z } from 'zod';
import type { FacilitySchemas } from '../schemas';

type Facility = z.infer<typeof FacilitySchemas.FacilitySchema>;
type CreateFacilityData = z.infer<typeof FacilitySchemas.CreateFacilitySchema>;
type UpdateFacilityData = z.infer<typeof FacilitySchemas.UpdateFacilitySchema>;
type FacilityFilterOptions = z.infer<
  typeof FacilitySchemas.FacilityFilterSchema
>;
type FacilityPaginationOptions = z.infer<
  typeof FacilitySchemas.FacilityPaginationSchema
>;
type PaginatedFacilities = z.infer<
  typeof FacilitySchemas.PaginatedFacilitiesSchema
>;

export type {
  Facility,
  CreateFacilityData,
  UpdateFacilityData,
  FacilityFilterOptions,
  FacilityPaginationOptions,
  PaginatedFacilities,
};
