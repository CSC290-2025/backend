export interface WasteType {
  id: number;
  type_name: string;
  typical_weight_kg: number | null;
}

export interface WasteLogRequest {
  waste_type_name: string;
  weight: number;
}

export interface WasteLogInternal extends WasteLogRequest {
  user_id: number;
}

export interface WasteLog {
  id: number;
  user_id: number;
  waste_type_id: number | null;
  log_date: Date | null;
  weight_kg: number;
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
    entry_count: number;
  }[];
}

export interface DailyLog {
  by_log: {
    waste_type: string | undefined;
    total_weight: number;
    entry_count: number;
  }[];
}
