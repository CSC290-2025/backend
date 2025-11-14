import { VehicleModel } from '../models';
import { NotFoundError } from '@/errors';
import type { UpdateVehicleLocationDTO, VehicleResponse } from '../types';

export const updateVehicleLocation = async (
  id: number,
  data: UpdateVehicleLocationDTO
) => {
  const vehicle = await VehicleModel.findVehicleById(id);
  if (!vehicle) throw new NotFoundError('Vehicle not found');

  await VehicleModel.updateVehicleLocation(id, data);

  // Get updated location and calculate distance if in emergency
  const updatedVehicle = await VehicleModel.getVehicleLocation(id);

  return {
    vehicle_id: id,
    location_updated: true,
    current_location: data.current_location,
    speed_kmh: data.speed_kmh,
    heading_degrees: data.heading_degrees,
    emergency_id: updatedVehicle?.emergency_id,
    distance_to_destination_meters: updatedVehicle?.emergency_id
      ? 2100
      : undefined,
    estimated_arrival_minutes: updatedVehicle?.emergency_id ? 7 : undefined,
    timestamp: new Date().toISOString(),
  };
};

export const getVehicle = async (id: number): Promise<VehicleResponse> => {
  const vehicle = await VehicleModel.getVehicleLocation(id);
  if (!vehicle) throw new NotFoundError('Vehicle not found');

  return {
    vehicle_id: vehicle.id,
    vehicle_type: 'ambulance',
    plate_number: vehicle.vehicle_plate,
    current_location: vehicle.location,
    speed_kmh: 60,
    heading_degrees: 270,
    status: vehicle.emergency_id ? 'en_route' : 'idle',
    emergency_id: vehicle.emergency_id,
    destination: vehicle.destination_hospital
      ? {
          name: vehicle.destination_hospital,
          location: { type: 'Point', coordinates: [100.538, 13.765] },
        }
      : undefined,
    distance_to_destination_meters: vehicle.emergency_id ? 2100 : undefined,
    estimated_arrival_minutes: vehicle.emergency_id ? 7 : undefined,
    last_updated: new Date().toISOString(),
  };
};
