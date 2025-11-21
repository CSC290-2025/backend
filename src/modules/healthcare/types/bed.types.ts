import type { z } from 'zod';
import type { BedSchemas } from '../schemas';

type Bed = z.infer<typeof BedSchemas.BedSchema>;
type CreateBedData = z.infer<typeof BedSchemas.CreateBedSchema>;
type UpdateBedData = z.infer<typeof BedSchemas.UpdateBedSchema>;
type BedFilterOptions = z.infer<typeof BedSchemas.BedFilterSchema>;
type BedPaginationOptions = z.infer<typeof BedSchemas.PaginationSchema>;
type PaginatedBeds = z.infer<typeof BedSchemas.PaginatedBedsSchema>;

export type {
  Bed,
  CreateBedData,
  UpdateBedData,
  BedFilterOptions,
  BedPaginationOptions,
  PaginatedBeds,
};
