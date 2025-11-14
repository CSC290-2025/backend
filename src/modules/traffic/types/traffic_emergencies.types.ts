import type { z } from 'zod';
import type { TrafficEmergencySchemas } from '../schemas';

/*type TrafficEmergency = z.infer<
  typeof TrafficEmergencySchemas.TrafficEmergencySchema
>;*/
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

// Emergency types
type TrafficEmergency = {
  id: number;
  user_id: number | null;
  accident_location: any | null; // geometry may come back as object/Buffer or null
  destination_hospital: string | null;
  status: string | null;
  ambulance_vehicle_id: number | null;
  created_at: Date;
};

export type {
  TrafficEmergency,
  CreateTrafficEmergencyData,
  UpdateTrafficEmergencyData,
  TrafficEmergencyFilterOptions,
  TrafficEmerPaginationOptions,
  PaginatedTrafficEmergencies,
};
