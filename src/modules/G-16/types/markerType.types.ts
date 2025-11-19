import type * as z from 'zod';
import type {
  CreateMarkerTypeSchema,
  UpdateMarkerTypeSchema,
  MarkerTypeResponseSchema,
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

type CreateMarkerTypeInput = z.infer<typeof CreateMarkerTypeSchema>;
type UpdateMarkerTypeInput = z.infer<typeof UpdateMarkerTypeSchema>;
type MarkerTypeResponse = z.infer<typeof MarkerTypeResponseSchema>;

export type {
  CreateMarkerTypeInput,
  UpdateMarkerTypeInput,
  MarkerTypeResponse,
};
