import { z } from 'zod';
import { createPostRoute, createGetRoute } from '@/utils/openapi-helpers';

// Schema for logging waste
const WasteLogRequestSchema = z.object({
  waste_type_name: z.string().min(1, 'Waste type name is required'),
  weight: z.number().positive('Weight must be greater than 0'),
});

// Schema for waste type response
const WasteTypeSchema = z.object({
  id: z.number(),
  type_name: z.string(),
  typical_weight_kg: z.number().nullable(),
});

const WasteTypesResponseSchema = z.object({
  wasteTypes: z.array(WasteTypeSchema),
});

// Schema for waste log response
const WasteLogResponseSchema = z.object({
  id: z.number(),
  waste_type_id: z.number(),
  total_collection_weight: z.number(),
  collection_date: z.string(),
  event_id: z.number().nullable(),
  waste_types: z.object({
    type_name: z.string(),
  }),
});

// Schema for monthly stats response
const MonthlyStatsResponseSchema = z.object({
  stats: z.object({
    month: z.number(),
    year: z.number(),
    total_weight_kg: z.number(),
    by_type: z.array(
      z.object({
        waste_type: z.string().optional(),
        total_weight: z.number(),
        entry_count: z.number(),
      })
    ),
  }),
});

// OpenAPI route definitions
const getWasteTypesRoute = createGetRoute({
  path: '/waste-types',
  summary: 'Get all waste types',
  responseSchema: WasteTypesResponseSchema,
  tags: ['Waste'],
});

const logWasteRoute = createPostRoute({
  path: '/waste/log',
  summary: 'Log a waste collection event',
  requestSchema: WasteLogRequestSchema, // now expects waste_type_name
  responseSchema: WasteLogResponseSchema,
  tags: ['Waste'],
});

const getStatsRoute = createGetRoute({
  path: '/waste/stats',
  summary: 'Get monthly waste statistics',
  responseSchema: MonthlyStatsResponseSchema,
  tags: ['Waste', 'Analytics'],
});

export const WasteSchemas = {
  WasteLogRequestSchema,
  WasteTypeSchema,
  WasteTypesResponseSchema,
  WasteLogResponseSchema,
  MonthlyStatsResponseSchema,
  getWasteTypesRoute,
  logWasteRoute,
  getStatsRoute,
};
