import * as z from 'zod';

export const LocationMarkerTypeSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const CreateMarkerTypeSchema = z.object({
  marker_type_id: z.string().transform(Number).optional(),
  description: z.string().optional().nullable(),
  marker_type_icon: z.string().max(255).optional().nullable(),
  location: LocationMarkerTypeSchema.optional().nullable(),
});

export const UpdateMarkerTypeSchema = z.object({
  marker_type_icon: z.string().max(255).optional().nullable(),
  location: LocationMarkerTypeSchema.optional().nullable(),
});

export const MarkerTypeResponseSchema = z.object({
  id: z.number().int(),
  marker_type_icon: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const MarkerTypeQuerySchema = z.object({
  marker_type_id: z.string().transform(Number).optional(),
  marker_type_ids: z
    .string()
    .transform((val) => val.split(',').map(Number))
    .optional(),
  limit: z.string().transform(Number).default(100).optional(),
  offset: z.string().transform(Number).default(0).optional(),
  sortBy: z
    .enum(['created_at', 'updated_at', 'id'])
    .default('created_at')
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});