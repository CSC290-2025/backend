// source/traffic/models/traffic-light.model.ts
import prisma from '@/config/client';
import { handlePrismaError } from '@/errors';
import type { TrafficLight, UpdateTrafficLightData } from '../types';

const update = async (
  id: number,
  data: UpdateTrafficLightData
): Promise<TrafficLight> => {
  try {
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.current_color !== undefined)
      updateData.current_color = data.current_color;
    if (data.auto_mode !== undefined) updateData.auto_mode = data.auto_mode;
    if (data.ip_address !== undefined) updateData.ip_address = data.ip_address;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.density_level !== undefined)
      updateData.density_level = data.density_level;

    const trafficLight = await prisma.traffic_lights.update({
      where: { id },
      data: updateData,
    });

    return {
      id: trafficLight.id,
      intersection_id: trafficLight.intersection_id,
      road_id: trafficLight.road_id,
      ip_address: trafficLight.ip_address,
      latitude: Number(trafficLight.latitude),
      longitude: Number(trafficLight.longitude),
      status: trafficLight.status,
      current_color: trafficLight.current_color,
      density_level: trafficLight.density_level,
      auto_mode: trafficLight.auto_mode,
      last_updated: trafficLight.last_updated.toISOString(),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateDensity = async (
  id: number,
  density_level: number,
  current_color?: number
): Promise<TrafficLight> => {
  try {
    const updateData: any = {
      density_level,
    };

    if (current_color !== undefined) {
      updateData.current_color = current_color;
    }

    const trafficLight = await prisma.traffic_lights.update({
      where: { id },
      data: updateData,
    });

    return {
      id: trafficLight.id,
      intersection_id: trafficLight.intersection_id,
      road_id: trafficLight.road_id,
      ip_address: trafficLight.ip_address,
      latitude: Number(trafficLight.latitude),
      longitude: Number(trafficLight.longitude),
      status: trafficLight.status,
      current_color: trafficLight.current_color,
      density_level: trafficLight.density_level,
      auto_mode: trafficLight.auto_mode,
      last_updated: trafficLight.last_updated.toISOString(),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateColor = async (
  id: number,
  color: number
): Promise<TrafficLight | null> => {
  try {
    const existing = await prisma.traffic_lights.findUnique({ where: { id } });
    if (!existing) return null; // no record found

    const trafficLight = await prisma.traffic_lights.update({
      where: { id },
      data: { current_color: color },
    });

    return {
      id: trafficLight.id,
      intersection_id: trafficLight.intersection_id,
      road_id: trafficLight.road_id,
      ip_address: trafficLight.ip_address,
      latitude: Number(trafficLight.latitude),
      longitude: Number(trafficLight.longitude),
      status: trafficLight.status,
      current_color: trafficLight.current_color,
      density_level: trafficLight.density_level,
      auto_mode: trafficLight.auto_mode,
      last_updated: trafficLight.last_updated.toISOString(),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.traffic_lights.delete({ where: { id } });
  } catch (error) {
    handlePrismaError(error);
  }
};

const count = async (filters?: {
  intersection_id?: number;
  road_id?: number;
  status?: number;
  auto_mode?: boolean;
}): Promise<number> => {
  try {
    const where: any = {};

    if (filters?.intersection_id) {
      where.intersection_id = filters.intersection_id;
    }

    if (filters?.road_id) {
      where.road_id = filters.road_id;
    }

    if (filters?.status !== undefined) {
      where.status = filters.status;
    }

    if (filters?.auto_mode !== undefined) {
      where.auto_mode = filters.auto_mode;
    }

    return await prisma.traffic_lights.count({ where });
  } catch (error) {
    handlePrismaError(error);
  }
};

export { update, updateDensity, updateColor, deleteById, count };
