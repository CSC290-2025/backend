// source/traffic/types/traffic-light.types.ts
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

// Road and Intersection types
type Intersection = {
  id: number;
  latitude: number;
  longitude: number;
};

type Road = {
  id: number;
  name: string;
  start_intersection_id: number;
  end_intersection_id: number;
  length_meters: number;
};

// Light Request types
type TrafficLightRequest = {
  id: number;
  traffic_light_id: number;
  requested_at: string;
};

type CreateLightRequestData = {
  traffic_light_id: number;
};

/* Vehicle types
type Vehicle = {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  vehicle_plate: string;
};*/

// Emergency types
type TrafficEmergency = {
  id: number;
  user_id: number;
  accident_location: string | null;
  destination_hospital: string;
  status: string;
  ambulance_vehicle_id: number;
  created_at: string;
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
  GoogleMapsTrafficData,
  TrafficLightCycleConfig,
  Intersection,
  Road,
  TrafficLightRequest,
  CreateLightRequestData,
  //Vehicle,
  TrafficEmergency,
  CreateEmergencyData,
};
