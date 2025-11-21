import type { z } from 'zod';
import type { EmergencyCallSchemas } from '../schemas';

type EmergencyCall = z.infer<typeof EmergencyCallSchemas.EmergencyCallSchema>;
type CreateEmergencyCallData = z.infer<
  typeof EmergencyCallSchemas.CreateEmergencyCallSchema
>;
type UpdateEmergencyCallData = z.infer<
  typeof EmergencyCallSchemas.UpdateEmergencyCallSchema
>;
type EmergencyCallFilterOptions = z.infer<
  typeof EmergencyCallSchemas.EmergencyCallFilterSchema
>;
type EmergencyCallPaginationOptions = z.infer<
  typeof EmergencyCallSchemas.EmergencyCallPaginationSchema
>;
type PaginatedEmergencyCalls = z.infer<
  typeof EmergencyCallSchemas.PaginatedEmergencyCallsSchema
>;

export type {
  EmergencyCall,
  CreateEmergencyCallData,
  UpdateEmergencyCallData,
  EmergencyCallFilterOptions,
  EmergencyCallPaginationOptions,
  PaginatedEmergencyCalls,
};
