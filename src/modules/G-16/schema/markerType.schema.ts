

import * as z from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

export const CreateMarkerTypeSchema = z.object({
  marker_type_id: z.coerce.number().optional(),
  description: z.string().optional().nullable(),
  marker_type_icon: z.string().max(255).optional().nullable(),
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional()
    .nullable(),
});

export const UpdateMarkerTypeSchema = z.object({
  marker_type_icon: z.string().max(255).optional().nullable(),
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional()
    .nullable(),
});

export const MarkerTypeResponseSchema = z.object({
  id: z.number().int(),
  marker_type_icon: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const MarkerTypeQuerySchema = z.object({
  marker_type_id: z.coerce.number().optional(),

  marker_type_ids: z
    .string()
    .transform((val) => val.split(',').map(Number))
    .optional()
    .openapi({ example: '1,2,3', type: 'string' }),

  limit: z.coerce.number().default(100).optional(),
  offset: z.coerce.number().default(0).optional(),
  sortBy: z
    .enum(['created_at', 'updated_at', 'id'])
    .default('created_at')
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

export const MarkerTypeIdParamSchema = z.object({
  id: z.coerce.number(),
});

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
export const MarkerTypeIdByTypeParamSchema = z.object({
  id: z.coerce.number(),
});

export const getMarkerTypesByTypeRoute = createGetRoute({
  path: '/api/marker-types/type/{id}',
  summary: 'Get marker types by type',
  params: MarkerTypeIdByTypeParamSchema,
  responseSchema: z.object({
    marker: z.any(),
    count: z.number(),
  }),
  tags: ['MarkerType'],
});

export const MarkerTypeFilterBodySchema = z.object({
  marker_type_ids: z.array(z.coerce.number().int()).min(1),
});

export const getMarkerTypeByTypesRoute = createPostRoute({
  path: '/api/marker-types/filter',
  summary: 'Get marker types by types (filter)',
  requestSchema: MarkerTypeFilterBodySchema,
  responseSchema: z.object({
    marker: z.any(),
    count: z.number(),
  }),
  tags: ['MarkerType'],
});

export const MarkerTypeBoundsBodySchema = z.object({
  minLat: z.coerce.number().openapi({ example: 13.72 }), 
  maxLat: z.coerce.number().openapi({ example: 13.75 }),
  minLng: z.coerce.number().openapi({ example: 100.50 }),
  maxLng: z.coerce.number().openapi({ example: 100.55 }),
  markerTypeIds: z.array(z.coerce.number().int()).optional().openapi({ example: [1, 5] }),
}).openapi({
  example: {
    minLat: 13.72,
    maxLat: 13.75,
    minLng: 100.50,
    maxLng: 100.55,
    markerTypeIds: [1, 2, 5]
  }
});

export const getMarkerTypesInBoundsRoute = createPostRoute({
  path: '/api/marker-types/bounds',
  summary: 'Get marker types in bounds',
  requestSchema: MarkerTypeBoundsBodySchema,
  responseSchema: z.object({
    marker: z.any(),
    count: z.number(),
  }),
  tags: ['MarkerType'],
});
