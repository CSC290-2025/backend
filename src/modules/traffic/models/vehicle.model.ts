import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { UpdateVehicleLocationDTO } from '../types';

export const findVehicleById = async (id: number) => {
  try {
    return await prisma.vehicles.findUnique({
      where: { id },
      include: {
        users: true,
        traffic_emergencies: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
};

export const updateVehicleLocation = async (
  id: number,
  data: UpdateVehicleLocationDTO
) => {
  try {
    // Convert coordinates to PostGIS Point format
    const point = `POINT(${data.current_location.coordinates[0]} ${data.current_location.coordinates[1]})`;

    return await prisma.$executeRaw`
      UPDATE vehicles 
      SET current_location = ST_GeomFromText(${point}, 4326)
      WHERE id = ${id}
    `;
  } catch (error) {
    handlePrismaError(error);
  }
};

export const getVehicleLocation = async (id: number) => {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        v.id,
        v.vehicle_plate,
        ST_AsGeoJSON(v.current_location) as location,
        u.id as user_id,
        te.id as emergency_id,
        te.destination_hospital
      FROM vehicles v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN traffic_emergencies te ON te.ambulance_vehicle_id = v.id AND te.status = 'active'
      WHERE v.id = ${id}
    `;

    if (result.length === 0) return null;

    const vehicle = result[0];
    return {
      ...vehicle,
      location: JSON.parse(vehicle.location),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};
