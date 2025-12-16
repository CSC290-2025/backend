import * as z from 'zod';
// import {
//   createGetRoute,
//   createPostRoute,
//   createPutRoute,
//   createDeleteRoute,
// } from "@/utils/openapi-helpers";

export const LocationMarkerSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const CreateMarkerSchema = z.object({
  description: z.string().optional().nullable(),
  marker_type_id: z.number().int().positive().optional().nullable(),
  location: LocationMarkerSchema.optional().nullable(),
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
  sortBy: z
    .enum(['created_at', 'updated_at', 'id'])
    .default('created_at')
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

// Schema for bounding box query
export const BoundingBoxSchema = z.object({
  north: z.string().transform(Number),
  south: z.string().transform(Number),
  east: z.string().transform(Number),
  west: z.string().transform(Number),
});
