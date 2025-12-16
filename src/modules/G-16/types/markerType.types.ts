import type * as z from 'zod';
import type {
  CreateMarkerTypeSchema,
  UpdateMarkerTypeSchema,
  MarkerTypeResponseSchema,
  MarkerTypeQuerySchema,
} from '@/modules/G-16/schema/markerType.schema';
// import type { MarkerTypeSchema } from '@/modules/G-16/schema/markerType.schema';

export type markerType = {
  id: string;
  lat: number;
  lng: number;
  title?: string | null;
  description?: string | null;
  marker_type_id?: number | null;
  confidence?: number;
  categories?: string[];
  created_at: string;
};

export interface MarkerRow {
  id: number;
  marker_type_id: number | null;
  description: string | null;
  location: any;
  created_at: Date;
  updated_at: Date;
  marker_type_id_ref: number | null;
  marker_type_icon: string | null;
}

type MarkerTypeQuery = z.infer<typeof MarkerTypeQuerySchema>;
type CreateMarkerTypeInput = z.infer<typeof CreateMarkerTypeSchema>;
type UpdateMarkerTypeInput = z.infer<typeof UpdateMarkerTypeSchema>;
type MarkerTypeResponse = z.infer<typeof MarkerTypeResponseSchema>;

export type {
  CreateMarkerTypeInput,
  UpdateMarkerTypeInput,
  MarkerTypeResponse,
  MarkerTypeQuery,
};
