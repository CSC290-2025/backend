// source/types/intersection.types.ts
import type { z } from 'zod';
import type { IntersectionSchemas } from '../schemas';
import type { TrafficLight } from './traffic-light.types';

// Infer types from Zod schemas
type Intersection = z.infer<typeof IntersectionSchemas.IntersectionSchema>;
type CreateIntersectionData = z.infer<
  typeof IntersectionSchemas.CreateIntersectionSchema
>;
type UpdateIntersectionData = z.infer<
  typeof IntersectionSchemas.UpdateIntersectionSchema
>;
type IntersectionWithLights = z.infer<
  typeof IntersectionSchemas.IntersectionWithLightsSchema
>;

// Direction enum for traffic light positioning
type Direction = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';

// Intersection statistics
interface IntersectionStats {
  totalLights: number;
  activeLights: number;
  averageDensity: number;
  coordinatedTiming: boolean;
}

/*Location type for PostGIS geometry
type Location = {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
};*/

export type {
  Intersection,
  CreateIntersectionData,
  UpdateIntersectionData,
  IntersectionWithLights,
  Direction,
  IntersectionStats,
};
