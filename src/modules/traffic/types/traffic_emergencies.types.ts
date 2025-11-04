import type { z } from 'zod';
import type { TrafficEmergencySchemas } from '../schemas';

type TrafficEmergency = z.infer<
  typeof TrafficEmergencySchemas.TrafficEmergencySchema
>;
type CreateTrafficEmergencyData = z.infer<
  typeof TrafficEmergencySchemas.CreateTrafficEmergencySchema
>;
type UpdateTrafficEmergencyData = z.infer<
  typeof TrafficEmergencySchemas.UpdateTrafficEmergencySchema
>;
type TrafficEmergencyFilterOptions = z.infer<
  typeof TrafficEmergencySchemas.TrafficEmergencyFilterSchema
>;
type TrafficEmerPaginationOptions = z.infer<
  typeof TrafficEmergencySchemas.PaginationSchema
>;
type PaginatedTrafficEmergencies = z.infer<
  typeof TrafficEmergencySchemas.PaginatedTrafficEmergenciesSchema
>;

export type {
  TrafficEmergency,
  CreateTrafficEmergencyData,
  UpdateTrafficEmergencyData,
  TrafficEmergencyFilterOptions,
  TrafficEmerPaginationOptions,
  PaginatedTrafficEmergencies,
};
