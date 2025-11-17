import type * as z from 'zod';
import type {
  CreateMarkerSchema,
  UpdateMarkerSchema,
  MarkerResponseSchema,
  MarkerQuerySchema,
  BoundingBoxSchema,
} from '@/modules/G-16/schema/marker.schema';

export type CreateMarkerInput = z.infer<typeof CreateMarkerSchema>;
export type UpdateMarkerInput = z.infer<typeof UpdateMarkerSchema>;
export type MarkerResponse = z.infer<typeof MarkerResponseSchema>;
export type MarkerQuery = z.infer<typeof MarkerQuerySchema>;
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;