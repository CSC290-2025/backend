import { z } from 'zod';
import {
  createPostRoute,
  createGetRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { authMiddleware } from '@/middlewares';

const WasteLogRequestSchema = z.object({
  waste_type_name: z.string().min(1, 'Waste type name is required'),
  weight: z.number().positive('Weight must be greater than 0'),
});

const WasteTypeSchema = z.object({
  id: z.number(),
  type_name: z.string(),
  typical_weight_kg: z.number().nullable(),
});

const WasteTypesResponseSchema = z.object({
  wasteTypes: z.array(WasteTypeSchema),
});

const WasteLogResponseSchema = z.object({
  id: z.number(),
  waste_type_id: z.number(),
  weight_kg: z.number(),
  log_date: z.string(),
  waste_types: z.object({
    type_name: z.string(),
  }),
});

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

const DailyStatsResponseSchema = z.object({
  stats: z.object({
    date: z.string(),
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

const getWasteTypesRoute = createGetRoute({
  path: '/waste-types',
  summary: 'Get all waste types',
  responseSchema: WasteTypesResponseSchema,
  tags: ['Waste'],
});

const getDailyStatsRoute = createGetRoute({
  path: '/waste/stats/daily',
  summary: 'Get daily waste statistics',
  responseSchema: DailyStatsResponseSchema,
  tags: ['Waste', 'Analytics'],
  middleware: [authMiddleware],
});

const logWasteRoute = createPostRoute({
  path: '/waste/log',
  summary: 'Log a waste collection event',
  requestSchema: WasteLogRequestSchema,
  responseSchema: WasteLogResponseSchema,
  tags: ['Waste'],
  middleware: [authMiddleware],
});

const getStatsRoute = createGetRoute({
  path: '/waste/stats',
  summary: 'Get monthly waste statistics',
  responseSchema: MonthlyStatsResponseSchema,
  tags: ['Waste', 'Analytics'],
  middleware: [authMiddleware],
});

const deleteLogRoute = createDeleteRoute({
  path: '/waste/log/{id}',
  summary: 'Delete a waste log entry',
  params: z.object({
    id: z.coerce.number().positive('ID must be a positive number'),
  }),
  tags: ['Waste'],
  middleware: [authMiddleware],
});

export const WasteSchemas = {
  WasteLogRequestSchema,
  WasteTypeSchema,
  WasteTypesResponseSchema,
  WasteLogResponseSchema,
  MonthlyStatsResponseSchema,
  DailyStatsResponseSchema,
  getWasteTypesRoute,
  logWasteRoute,
  getStatsRoute,
  getDailyStatsRoute,
  deleteLogRoute,
};
