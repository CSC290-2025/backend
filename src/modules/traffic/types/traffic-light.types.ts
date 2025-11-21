// source/types/traffic-light.types.ts
import type { z } from 'zod';
import type { TrafficLightSchemas } from '../schemas';

// Infer types from Zod schemas
type TrafficLight = z.infer<typeof TrafficLightSchemas.TrafficLightSchema>;
type CreateTrafficLightData = z.infer<
  typeof TrafficLightSchemas.CreateTrafficLightSchema
>;
type UpdateTrafficLightData = z.infer<
  typeof TrafficLightSchemas.UpdateTrafficLightSchema
>;
type TrafficDensity = z.infer<typeof TrafficLightSchemas.TrafficDensitySchema>;
type TrafficLightTiming = z.infer<
  typeof TrafficLightSchemas.TrafficLightTimingSchema
>;
type TrafficLightColor = z.infer<
  typeof TrafficLightSchemas.TrafficLightColorEnum
>;
type DensityLevel = z.infer<typeof TrafficLightSchemas.DensityLevelEnum>;

// Location type for PostGIS geometry
type Location = {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
};

// Additional types for Google Maps integration
interface GoogleMapsTrafficData {
  density: number;
  speedKmh: number;
  congestionLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
}

interface TrafficLightCycleConfig {
  greenDuration: number;
  yellowDuration: number;
  redDuration: number;
  totalCycle: number;
}

// Light Request types
type TrafficLightRequest = {
  id: number;
  traffic_light_id: number;
  requested_at: string;
};

type CreateLightRequestData = {
  traffic_light_id: number;
};

type CreateEmergencyData = {
  user_id: number;
  accident_location?: string;
  destination_hospital: string;
  ambulance_vehicle_id: number;
};

export type {
  TrafficLight,
  CreateTrafficLightData,
  UpdateTrafficLightData,
  TrafficDensity,
  TrafficLightTiming,
  TrafficLightColor,
  DensityLevel,
  Location,
  GoogleMapsTrafficData,
  TrafficLightCycleConfig,
  TrafficLightRequest,
  CreateLightRequestData,
  CreateEmergencyData,
};
