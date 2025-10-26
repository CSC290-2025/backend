import { z } from 'zod';
import { VehicleSchemas } from '../schemas';

export type VehicleLocation = z.infer<typeof VehicleSchemas.LocationSchema>;
export type UpdateVehicleLocationDTO = z.infer<
  typeof VehicleSchemas.UpdateVehicleLocationSchema
>;
export type VehicleResponse = z.infer<
  typeof VehicleSchemas.VehicleResponseSchema
>;

export interface Vehicle {
  id: number;
  user_id: number;
  current_location: any;
  vehicle_plate: string;
}
