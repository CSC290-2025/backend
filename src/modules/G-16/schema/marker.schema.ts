import * as z from 'zod';

export const CreateMarkerSchema = z.object({
  description: z.string().optional().nullable(),
  marker_type_id: z.number().int().positive().optional().nullable(),
  location: z.any().optional().nullable(),
});

export const UpdateMarkerSchema = z.object({
  location: z.any().optional().nullable(),
  description: z.string().optional().nullable(),
  marker_type_id: z.number().int().positive().optional().nullable(),
});

export const MarkerResponseSchema = z.object({
  id: z.number().int(),
  description: z.string().nullable(),
  location: z.any().nullable(),
  marker_type_id: z.number().int().nullable(),
  marker_type: z
    .object({
      id: z.number().int(),
      marker_type_icon: z.string().nullable(),
      marker_type_color: z.string().nullable(),
    })
    .nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const MarkerQuerySchema = z.object({
  marker_type_id: z.string().transform(Number).optional(),
  marker_type_ids: z
    .string()
    .transform((val) => val.split(',').map(Number))
    .optional(),
  limit: z.string().transform(Number).default(100).optional(),
  offset: z.string().transform(Number).default(0).optional(),
  //   limit: z.coerce.number().int().min(1).optional().default(100),
  //   offset: z.coerce.number().int().min(0).optional().default(0),
  sortBy: z
    .enum(['created_at', 'updated_at', 'id'])
    .default('created_at')
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

// Schema สำหรับ bounding box query
export const BoundingBoxSchema = z.object({
  north: z.string().transform(Number),
  south: z.string().transform(Number),
  east: z.string().transform(Number),
  west: z.string().transform(Number),
});
