// source/services/traffic-light.service.ts
import { TrafficLightModel } from '../models';
import * as GoogleMapsService from './google-maps.service';
import * as TimingService from './timing.service';
import type {
  TrafficLight,
  CreateTrafficLightData,
  UpdateTrafficLightData,
  TrafficDensity,
  TrafficLightTiming,
  TrafficLightCycleConfig,
} from '../types';
import { NotFoundError, ValidationError } from '@/errors';

/**
 * Get traffic light by ID with current status
 */
const getTrafficLightById = async (
  id: number
): Promise<{
  trafficLight: TrafficLight;
  timing?: TrafficLightTiming;
  density?: TrafficDensity;
}> => {
  const trafficLight = await TrafficLightModel.findById(id);
  if (!trafficLight) {
    throw new NotFoundError('Traffic light not found');
  }

  // Calculate current timing based on density
  const timing = TimingService.calculateTimingByDensity(
    trafficLight.density_level
  );

  return {
    trafficLight,
    timing,
  };
};

/**
 * Create a new traffic light
 */
const createTrafficLight = async (
  data: CreateTrafficLightData
): Promise<TrafficLight> => {
  // Validate location
  if (data.latitude < -90 || data.latitude > 90) {
    throw new ValidationError('Latitude must be between -90 and 90');
  }

  if (data.longitude < -180 || data.longitude > 180) {
    throw new ValidationError('Longitude must be between -180 and 180');
  }

  // Validate IP address format (INET type)
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(data.ip_address)) {
    throw new ValidationError('Invalid IP address format');
  }

  return await TrafficLightModel.create(data);
};

/**
 * Update traffic light configuration
 */
const updateTrafficLight = async (
  id: number,
  data: UpdateTrafficLightData
): Promise<TrafficLight> => {
  const existing = await TrafficLightModel.findById(id);
  if (!existing) {
    throw new NotFoundError('Traffic light not found');
  }

  // Validate location if provided
  if (data.latitude !== undefined) {
    if (data.latitude < -90 || data.latitude > 90) {
      throw new ValidationError('Latitude must be between -90 and 90');
    }
  }

  if (data.longitude !== undefined) {
    if (data.longitude < -180 || data.longitude > 180) {
      throw new ValidationError('Longitude must be between -180 and 180');
    }
  }

  // Validate IP address if provided
  if (data.ip_address) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(data.ip_address)) {
      throw new ValidationError('Invalid IP address format');
    }
  }

  return await TrafficLightModel.update(id, data);
};

/**
 * Delete a traffic light
 */
const deleteTrafficLight = async (id: number): Promise<void> => {
  const existing = await TrafficLightModel.findById(id);
  if (!existing) {
    throw new NotFoundError('Traffic light not found');
  }

  await TrafficLightModel.deleteById(id);
};

/**
 * List all traffic lights with filters
 */
const listTrafficLights = async (filters?: {
  intersection_id?: number;
  road_id?: number;
  status?: number;
  auto_mode?: boolean;
  min_density?: number;
  max_density?: number;
}): Promise<{ trafficLights: TrafficLight[]; total: number }> => {
  const trafficLights = await TrafficLightModel.findAll(filters);
  const total = await TrafficLightModel.count(filters);

  return { trafficLights, total };
};

/**
 * Get traffic lights by intersection
 */
const getTrafficLightsByIntersection = async (
  intersection_id: number
): Promise<{ trafficLights: TrafficLight[]; total: number }> => {
  const trafficLights =
    await TrafficLightModel.findByIntersection(intersection_id);

  return {
    trafficLights,
    total: trafficLights.length,
  };
};

/**
 * Get traffic lights by road
 */
const getTrafficLightsByRoad = async (
  road_id: number
): Promise<{ trafficLights: TrafficLight[]; total: number }> => {
  const trafficLights = await TrafficLightModel.findByRoad(road_id);

  return {
    trafficLights,
    total: trafficLights.length,
  };
};

/**
 * Calculate traffic density and update traffic light
 */
const calculateAndUpdateDensity = async (
  id: number
): Promise<{
  trafficLightId: number;
  currentDensity: TrafficDensity;
  recommendedTiming: TrafficLightCycleConfig;
  calculatedAt: string;
}> => {
  const trafficLight = await TrafficLightModel.findById(id);
  if (!trafficLight) {
    throw new NotFoundError('Traffic light not found');
  }

  // Check if auto mode is enabled
  if (!trafficLight.auto_mode) {
    throw new ValidationError('Traffic light is not in auto mode');
  }

  // Get traffic data from Google Maps
  const trafficData = await GoogleMapsService.calculateTrafficDensity(
    Number(trafficLight.latitude),
    Number(trafficLight.longitude)
  );

  // Calculate recommended timing
  const timing = TimingService.calculateAdaptiveTiming({
    densityLevel: trafficData.density,
    speedKmh: trafficData.speedKmh,
    timeOfDay: new Date(),
  });

  // Update traffic light density
  await TrafficLightModel.updateDensity(id, trafficData.density);

  const currentDensity: TrafficDensity = {
    level: GoogleMapsService.getDensityLevel(trafficData.density),
    vehicleCount: 0, // This would need vehicle detection system
    speedKmh: trafficData.speedKmh,
    timestamp: new Date(),
  };

  return {
    trafficLightId: id,
    currentDensity,
    recommendedTiming: timing,
    calculatedAt: new Date().toISOString(),
  };
};

/**
 * Manually update traffic light timing
 */
const updateTrafficLightTiming = async (
  id: number,
  timing: TrafficLightCycleConfig
): Promise<TrafficLight> => {
  const trafficLight = await TrafficLightModel.findById(id);
  if (!trafficLight) {
    throw new NotFoundError('Traffic light not found');
  }

  // Validate timing values
  if (timing.greenDuration < 10 || timing.greenDuration > 120) {
    throw new ValidationError(
      'Green duration must be between 10 and 120 seconds'
    );
  }

  if (timing.yellowDuration < 2 || timing.yellowDuration > 5) {
    throw new ValidationError(
      'Yellow duration must be between 2 and 5 seconds'
    );
  }

  if (timing.redDuration < 10 || timing.redDuration > 150) {
    throw new ValidationError(
      'Red duration must be between 10 and 150 seconds'
    );
  }

  // Note: In a real system, you would store timing in the traffic_light_timings table
  // For now, we just acknowledge the timing update
  return trafficLight;
};

/**
 * Update traffic light color manually
 */
const updateTrafficLightColor = async (
  id: number,
  color: number
): Promise<TrafficLight> => {
  const trafficLight = await TrafficLightModel.findById(id);
  if (!trafficLight) {
    throw new NotFoundError('Traffic light not found');
  }

  if (trafficLight.auto_mode) {
    throw new ValidationError('Cannot manually change color in auto mode');
  }

  if (color < 1 || color > 3) {
    throw new ValidationError(
      'Color must be 1 (RED), 2 (YELLOW), or 3 (GREEN)'
    );
  }

  const result = await TrafficLightModel.updateColor(id, color);
  if (!result) {
    throw new NotFoundError('Traffic light not found');
  }

  return result;
};

/**
 * Get coordinated timing for all lights at an intersection
 */
const getIntersectionCoordinatedTiming = async (
  intersection_id: number
): Promise<Map<number, TrafficLightCycleConfig>> => {
  const trafficLights =
    await TrafficLightModel.findByIntersection(intersection_id);

  if (trafficLights.length === 0) {
    throw new NotFoundError('No traffic lights found at this intersection');
  }

  const lightData = trafficLights.map((tl) => ({
    id: tl.id,
    densityLevel: tl.density_level,
  }));

  return TimingService.calculateCoordinatedTiming(lightData);
};

export {
  getTrafficLightById,
  createTrafficLight,
  updateTrafficLight,
  deleteTrafficLight,
  listTrafficLights,
  getTrafficLightsByIntersection,
  getTrafficLightsByRoad,
  calculateAndUpdateDensity,
  updateTrafficLightTiming,
  updateTrafficLightColor,
  getIntersectionCoordinatedTiming,
};
