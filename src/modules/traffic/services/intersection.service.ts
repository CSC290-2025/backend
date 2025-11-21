// source/services/intersection.service.ts
import { IntersectionModel } from '../models';
import type {
  Intersection,
  CreateIntersectionData,
  UpdateIntersectionData,
  IntersectionWithLights,
  IntersectionStats,
  Location,
} from '../types';
import { NotFoundError, ValidationError } from '@/errors';

/**
 * Get intersection by ID
 */
const getIntersectionById = async (
  id: number
): Promise<IntersectionWithLights> => {
  const intersection = await IntersectionModel.findByIdWithLights(id);
  if (!intersection) {
    throw new NotFoundError('Intersection not found');
  }
  return intersection;
};

/**
 * Create a new intersection
 */
const createIntersection = async (
  data: CreateIntersectionData
): Promise<Intersection> => {
  // Validate location
  if (!data.location || !data.location.coordinates) {
    throw new ValidationError('Location with coordinates is required');
  }

  const [longitude, latitude] = data.location.coordinates;

  if (latitude < -90 || latitude > 90) {
    throw new ValidationError('Latitude must be between -90 and 90');
  }

  if (longitude < -180 || longitude > 180) {
    throw new ValidationError('Longitude must be between -180 and 180');
  }

  return await IntersectionModel.create(data);
};

/**
 * Update intersection
 */
const updateIntersection = async (
  id: number,
  data: UpdateIntersectionData
): Promise<Intersection> => {
  const existing = await IntersectionModel.findById(id);
  if (!existing) {
    throw new NotFoundError('Intersection not found');
  }

  // Validate location
  const [longitude, latitude] = data.location.coordinates;

  if (latitude < -90 || latitude > 90) {
    throw new ValidationError('Latitude must be between -90 and 90');
  }

  if (longitude < -180 || longitude > 180) {
    throw new ValidationError('Longitude must be between -180 and 180');
  }

  return await IntersectionModel.update(id, data);
};

/**
 * Delete intersection
 */
const deleteIntersection = async (id: number): Promise<void> => {
  const existing = await IntersectionModel.findById(id);
  if (!existing) {
    throw new NotFoundError('Intersection not found');
  }

  // Check if intersection has traffic lights or roads
  const withLights = await IntersectionModel.findByIdWithLights(id);
  if (withLights) {
    if (withLights.traffic_lights.length > 0) {
      throw new ValidationError(
        `Cannot delete intersection with ${withLights.traffic_lights.length} traffic lights. ` +
          'Remove or reassign traffic lights first.'
      );
    }

    if (withLights.stats.totalRoads > 0) {
      throw new ValidationError(
        `Cannot delete intersection with ${withLights.stats.totalRoads} roads connected. ` +
          'Remove or reassign roads first.'
      );
    }
  }

  await IntersectionModel.deleteById(id);
};

/**
 * List all intersections
 */
const listIntersections = async (filters?: {
  min_lights?: number;
  max_lights?: number;
  has_roads?: boolean;
}): Promise<{ intersections: Intersection[]; total: number }> => {
  const intersections = await IntersectionModel.findAll(filters);
  const total = await IntersectionModel.count();

  return { intersections, total };
};

/**
 * List intersections with traffic lights
 */
const listIntersectionsWithLights = async (filters?: {
  min_lights?: number;
  max_lights?: number;
  has_roads?: boolean;
}): Promise<{ intersections: IntersectionWithLights[]; total: number }> => {
  const intersections = await IntersectionModel.findAllWithLights(filters);

  return {
    intersections,
    total: intersections.length,
  };
};

/**
 * Find nearby intersections
 */
const findNearbyIntersections = async (
  longitude: number,
  latitude: number,
  radiusMeters: number = 5000
): Promise<{ intersections: Intersection[]; total: number }> => {
  // Validate coordinates
  if (latitude < -90 || latitude > 90) {
    throw new ValidationError('Latitude must be between -90 and 90');
  }

  if (longitude < -180 || longitude > 180) {
    throw new ValidationError('Longitude must be between -180 and 180');
  }

  if (radiusMeters <= 0 || radiusMeters > 100000) {
    throw new ValidationError('Radius must be between 1 and 100000 meters');
  }

  const intersections = await IntersectionModel.findNearby(
    longitude,
    latitude,
    radiusMeters
  );

  return {
    intersections,
    total: intersections.length,
  };
};

/**
 * Get intersection statistics
 */
const getIntersectionStats = async (
  id: number
): Promise<{
  intersection_id: number;
  location: Location | null;
  stats: IntersectionStats & {
    averageWaitTime: number;
    peakHours: number[];
  };
}> => {
  const intersection = await IntersectionModel.findByIdWithLights(id);
  if (!intersection) {
    throw new NotFoundError('Intersection not found');
  }

  // Calculate basic stats
  const totalLights = intersection.traffic_lights.length;
  const activeLights = intersection.traffic_lights.filter(
    (l) => l.status === 1
  ).length;
  const avgDensity =
    totalLights > 0
      ? intersection.traffic_lights.reduce(
          (sum, l) => sum + (l.density_level || 0),
          0
        ) / totalLights
      : 0;

  // Mock data for wait time and peak hours (in real system, calculate from historical data)
  const averageWaitTime = avgDensity * 15; // Rough estimate: density * 15 seconds
  const peakHours = [7, 8, 9, 17, 18, 19]; // Typical rush hours

  return {
    intersection_id: id,
    location: intersection.location,
    stats: {
      totalLights,
      activeLights,
      averageDensity: Math.round(avgDensity * 10) / 10,
      coordinatedTiming: totalLights > 1,
      averageWaitTime: Math.round(averageWaitTime),
      peakHours,
    },
  };
};

/**
 * Validate intersection capacity (max 4 traffic lights)
 */
const validateIntersectionCapacity = async (
  intersection_id: number
): Promise<boolean> => {
  const intersection =
    await IntersectionModel.findByIdWithLights(intersection_id);
  if (!intersection) {
    throw new NotFoundError('Intersection not found');
  }

  if (intersection.traffic_lights.length >= 4) {
    throw new ValidationError(
      `Intersection (ID: ${intersection_id}) has reached maximum capacity (4 traffic lights). ` +
        'Cannot add more traffic lights to this intersection.'
    );
  }

  return true;
};

export {
  getIntersectionById,
  createIntersection,
  updateIntersection,
  deleteIntersection,
  listIntersections,
  listIntersectionsWithLights,
  findNearbyIntersections,
  getIntersectionStats,
  validateIntersectionCapacity,
};
