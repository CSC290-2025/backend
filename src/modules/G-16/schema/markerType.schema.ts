import * as z from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

// ====== schemas เดิม ======
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

export const MarkerTypeIdParamSchema = z.object({
  id: z.string(),
});

export const MarkerTypeIdParam2Schema = z.object({
  markerTypeId: z.string(),
});

// ====== OpenAPI route definitions ======
// สมมติ mount จริงเป็น /api/marker-types
export const getAllMarkerTypesRoute = createGetRoute({
  path: '/api/marker-types',
  summary: 'Get all marker types',
  query: MarkerTypeQuerySchema,
  responseSchema: z.object({
    marker: z.array(MarkerTypeResponseSchema),
    count: z.number(),
  }),
  tags: ['MarkerType'],
});

export const getMarkerTypeByIdRoute = createGetRoute({
  path: '/api/marker-types/{id}',
  summary: 'Get marker type by id',
  params: MarkerTypeIdParamSchema,
  responseSchema: z.object({
    marker: MarkerTypeResponseSchema.nullable(),
  }),
  tags: ['MarkerType'],
});

export const createMarkerTypeRoute = createPostRoute({
  path: '/api/marker-types',
  summary: 'Create marker type',
  requestSchema: CreateMarkerTypeSchema,
  responseSchema: z.object({
    marker: MarkerTypeResponseSchema,
  }),
  tags: ['MarkerType'],
});

export const updateMarkerTypeRoute = createPutRoute({
  path: '/api/marker-types/{id}',
  summary: 'Update marker type',
  params: MarkerTypeIdParamSchema,
  requestSchema: UpdateMarkerTypeSchema,
  responseSchema: z.object({
    marker: MarkerTypeResponseSchema.nullable(),
  }),
  tags: ['MarkerType'],
});

export const deleteMarkerTypeRoute = createDeleteRoute({
  path: '/api/marker-types/{id}',
  summary: 'Delete marker type',
  params: MarkerTypeIdParamSchema,
  tags: ['MarkerType'],
});

// (Optional) ถ้าคุณอยากให้ filter/bounds/type ขึ้นด้วย ต้องทำ route เพิ่มเองแบบนี้ด้วย
export const getMarkerTypesByTypeRoute = createGetRoute({
  path: '/api/marker-types/type/{markerTypeId}',
  summary: 'Get marker types by type',
  params: MarkerTypeIdParam2Schema,
  responseSchema: z.any(),
  tags: ['MarkerType'],
});
