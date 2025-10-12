import prisma from '@/config/client';

export interface TrafficLight {
  id: number;
  intersection_id: number;
  ip_address: string;
  location: { lat: number; lng: number };
  status: boolean;
  current_color: number; // 1=Red, 2=Yellow, 3=Green
  density_level: number; // 1-5
  auto_mode: boolean;
  last_updated: Date;
}

