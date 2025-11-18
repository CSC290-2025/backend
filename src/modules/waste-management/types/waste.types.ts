export interface WasteType {
  id: number;
  type_name: string;
  typical_weight_kg: number | null;
}

export interface WasteLogRequest {
  waste_type_name: string;
  weight: number;
}

export interface WasteLog {
  id: number;
  waste_type_id: number | null;
  total_collection_weight: number;
  collection_date: Date | null;
  event_id: number | null;
}

export interface WasteStats {
  month: number;
  year: number;
  total_weight_kg: number;
  by_type: {
    waste_type: string | undefined;
    total_weight: number;
    entry_count: number;
  }[];
}

export interface StatsQuery {
  month?: number;
  year?: number;
}

export interface DailyStats {
  date: string;
  total_weight_kg: number;
  by_type: {
    waste_type: string | undefined;
    total_weight: number;
    log_id: number;
  }[];
}
