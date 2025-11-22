// Type definitions
export type BinType = 'RECYCLABLE' | 'GENERAL' | 'HAZARDOUS' | 'ORGANIC';
export type BinStatus =
  | 'NORMAL'
  | 'OVERFLOW'
  | 'NEEDS_COLLECTION'
  | 'MAINTENANCE';

export interface CreateBinRequest {
  bin_name: string;
  bin_type: BinType;
  latitude: number;
  longitude: number;
  address?: string;
  capacity_kg?: number;
  status?: BinStatus;
}

export interface UpdateBinRequest {
  bin_name?: string;
  bin_type?: BinType;
  latitude?: number;
  longitude?: number;
  address?: string;
  capacity_kg?: number;
  status?: BinStatus;
}

export interface BinFilters {
  binType?: BinType;
  status?: BinStatus;
  lat?: number;
  lng?: number;
  radius?: number;
}

export const BIN_TYPE_COLORS = {
  RECYCLABLE: '#22c55e', // Green
  GENERAL: '#3b82f6', // Blue
  HAZARDOUS: '#eab308', // Yellow
  ORGANIC: '#8b5cf6', // Purple
} as const;

// Color mapping for bin status
export const BIN_STATUS_COLORS = {
  NORMAL: '#22c55e', // Green
  OVERFLOW: '#ef4444', // Red
  NEEDS_COLLECTION: '#f97316', // Orange
  MAINTENANCE: '#6b7280', // Gray
} as const;

// Helper function to get marker color based on status priority
export const getBinMarkerColor = (
  binType: BinType,
  status: BinStatus
): string => {
  // Status takes priority over type for urgent situations
  if (status === 'OVERFLOW' || status === 'NEEDS_COLLECTION') {
    return BIN_STATUS_COLORS[status];
  }
  if (status === 'MAINTENANCE') {
    return BIN_STATUS_COLORS.MAINTENANCE;
  }
  // Otherwise, use type color
  return BIN_TYPE_COLORS[binType];
};
