import type { bin } from '@/generated/prisma';

export type BinType = 'RECYCLABLE' | 'GENERAL' | 'HAZARDOUS';

export interface CreateBinRequest {
  bin_name: string;
  bin_type: BinType;
  latitude: number;
  longitude: number;
  address?: string | null;
  capacity_kg?: number | null;
}

export interface UpdateBinRequest {
  bin_name?: string;
  bin_type?: BinType;
  latitude?: number;
  longitude?: number;
  address?: string | null;
  capacity_kg?: number | null;
}

export interface BinFilters {
  binType?: BinType;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface BinWithDistance extends bin {
  numericDistance: number;
  distance: string;
}

export interface BinStats {
  totalBins: number;
  byType: Array<{
    bin_type: BinType;
    _count: { id: number };
  }>;
}
