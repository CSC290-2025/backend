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
import { RoadModel, IntersectionModel } from '../models';

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
  // Validate location exists
  if (!data.location) {
    throw new ValidationError('Location is required');
  }

  // Validate location
  const [longitude, latitude] = data.location.coordinates;
  if (latitude < -90 || latitude > 90) {
    throw new ValidationError('Latitude must be between -90 and 90');
  }

  if (longitude < -180 || longitude > 180) {
    throw new ValidationError('Longitude must be between -180 and 180');
  }

  // Validate IP address format (INET type)
  if (data.ip_address) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(data.ip_address)) {
      throw new ValidationError('Invalid IP address format');
    }
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
  if (data.location !== undefined) {
    if (data.location === null) {
      // Allow setting location to null if that's intended
      // Otherwise, you could throw an error here
    } else {
      const [longitude, latitude] = data.location.coordinates;

      if (latitude < -90 || latitude > 90) {
        throw new ValidationError('Latitude must be between -90 and 90');
      }

      if (longitude < -180 || longitude > 180) {
        throw new ValidationError('Longitude must be between -180 and 180');
      }
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
 * Partially update a traffic light — only allow a fixed set of fields.
 */
const partialUpdateTrafficLight = async (
  id: number,
  data: Record<string, unknown>
): Promise<TrafficLight> => {
  const existing = await TrafficLightModel.findById(id);
  if (!existing) throw new NotFoundError('Traffic light not found');

  const allowedKeys = [
    'status',
    'auto_mode',
    'location',
    'density_level',
    'green_duration',
    'red_duration',
  ] as const;

  // Check for disallowed keys
  const providedKeys = Object.keys(data || {});
  const disallowedKeys = providedKeys.filter(
    (key) =>
      !allowedKeys.includes(key as unknown as (typeof allowedKeys)[number])
  );

  if (disallowedKeys.length > 0) {
    throw new ValidationError(
      `The following fields are not allowed: ${disallowedKeys.join(', ')}. Allowed fields: ${allowedKeys.join(', ')}`
    );
  }

  const updates: Partial<UpdateTrafficLightData> = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // @ts-expect-error intentionally allowing any value type for allowed keys
      updates[key] = data[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ValidationError('At least one field must be provided for update');
  }

  // Validate location if provided
  if (updates.location !== undefined && updates.location !== null) {
    const [longitude, latitude] = updates.location.coordinates;
    if (latitude < -90 || latitude > 90) {
      throw new ValidationError('Latitude must be between -90 and 90');
    }
    if (longitude < -180 || longitude > 180) {
      throw new ValidationError('Longitude must be between -180 and 180');
    }
  }

  const updated = await TrafficLightModel.update(
    id,
    updates as UpdateTrafficLightData
  );
  return updated;
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

  // Check if location exists
  if (!trafficLight.location) {
    throw new ValidationError('Traffic light location is not set');
  }

  // Check if auto mode is enabled
  if (!trafficLight.auto_mode) {
    throw new ValidationError('Traffic light is not in auto mode');
  }

  // Extract coordinates from location
  const [longitude, latitude] = trafficLight.location.coordinates;

  // Get traffic data from Google Maps
  const trafficData = await GoogleMapsService.calculateTrafficDensity(
    latitude,
    longitude
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

/**
 * Get all traffic light statuses
 */
const getAllStatus = async (): Promise<{
  trafficLights: Array<{
    id: number;
    status: number | null;
    statusLabel: string;
    intersection_id: number | null;
    road_id: number | null;
    current_color: number;
    location: { type: 'Point'; coordinates: [number, number] } | null;
    last_updated: string | null;
  }>;
  total: number;
}> => {
  const trafficLights = await TrafficLightModel.listAllTrafficStatus();

  return {
    trafficLights,
    total: trafficLights.length,
  };
};

/**
 * Get traffic data tailored for calculation use.
 * Omits sensitive fields and expands `road_id` into a road object
 * with start/end intersection locations (only `location`).
 */
const getTrafficDataForCalculation = async (
  id: number
): Promise<{
  id: number;
  intersection_id: number | null;
  road: {
    id: number;
    start_intersection_id: number | null;
    end_intersection_id: number | null;
    length_meters: number | null;
    start_intersection?: {
      location: { type: 'Point'; coordinates: [number, number] } | null;
    } | null;
    end_intersection?: {
      location: { type: 'Point'; coordinates: [number, number] } | null;
    } | null;
  } | null;
  status: number | null;
  statusLabel?: string;
  intersection?: number | null;
  current_color?: never;
  location: { type: 'Point'; coordinates: [number, number] } | null;
  density_level: number;
  auto_mode: boolean;
  green_duration: number | null;
  red_duration: number | null;
  last_updated: string | null;
}> => {
  const tl = await TrafficLightModel.findById(id);
  if (!tl) throw new NotFoundError('Traffic light not found');

  // Build base result copying allowed fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {
    id: tl.id,
    intersection_id: tl.intersection_id,
    road: null,
    status: tl.status,
    location: tl.location,
    density_level: tl.density_level,
    auto_mode: tl.auto_mode,
    green_duration: tl.green_duration,
    red_duration: tl.red_duration,
    last_updated: tl.last_updated,
  };

  if (tl.road_id) {
    const road = await RoadModel.findById(tl.road_id);
    if (road) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any).road = {
        id: road.id,
        start_intersection_id: road.start_intersection_id ?? null,
        end_intersection_id: road.end_intersection_id ?? null,
        length_meters: road.length_meters ?? null,
      };

      // Fetch intersection locations and include only location
      if (road.start_intersection_id) {
        const startInt = await IntersectionModel.findById(
          road.start_intersection_id
        );
        result.road.start_intersection = {
          location: startInt ? startInt.location : null,
        };
      }

      if (road.end_intersection_id) {
        const endInt = await IntersectionModel.findById(
          road.end_intersection_id
        );
        result.road.end_intersection = {
          location: endInt ? endInt.location : null,
        };
      }
    }
  }

  return result;
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
  getAllStatus,
  getTrafficDataForCalculation,
  partialUpdateTrafficLight,
};
