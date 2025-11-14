import { z } from 'zod';
import { createGetRoute, createPutRoute } from '@/utils/openapi-helpers';

// Base Schemas (Export these for type inference)
export const LocationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const UpdateVehicleLocationSchema = z.object({
  current_location: LocationSchema,
  speed_kmh: z.number(),
  heading_degrees: z.number().min(0).max(360),
});

export const VehicleResponseSchema = z.object({
  vehicle_id: z.number(),
  vehicle_type: z.string(),
  plate_number: z.string(),
  current_location: LocationSchema,
  speed_kmh: z.number(),
  heading_degrees: z.number(),
  status: z.string(),
  emergency_id: z.number().optional(),
  destination: z
    .object({
      name: z.string(),
      location: LocationSchema,
    })
    .optional(),
  distance_to_destination_meters: z.number().optional(),
  estimated_arrival_minutes: z.number().optional(),
  last_updated: z.string().datetime({ offset: true }),
});

// Route Definitions
export const VehicleSchemas = {
  // Export schemas for type inference
  LocationSchema,
  UpdateVehicleLocationSchema,
  VehicleResponseSchema,

  // Routes
  updateLocationRoute: createPutRoute({
    path: '/api/vehicles/{id}/location',
    summary: 'Update vehicle location',
    requestSchema: UpdateVehicleLocationSchema,
    responseSchema: z.object({
      vehicle_id: z.number(),
      location_updated: z.boolean(),
      current_location: LocationSchema,
      speed_kmh: z.number(),
      heading_degrees: z.number(),
      emergency_id: z.number().optional(),
      distance_to_destination_meters: z.number().optional(),
      estimated_arrival_minutes: z.number().optional(),
      timestamp: z.iso.datetime({ offset: true }),
    }),
    params: z.object({ id: z.string() }),
    tags: ['Vehicles'],
  }),

  getVehicleRoute: createGetRoute({
    path: '/api/vehicles/{id}',
    summary: 'Get vehicle details',
    responseSchema: VehicleResponseSchema,
    params: z.object({ id: z.string() }),
    tags: ['Vehicles'],
  }),
};
