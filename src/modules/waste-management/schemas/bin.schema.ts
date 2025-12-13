import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const BinTypeEnum = z.enum(['RECYCLABLE', 'GENERAL', 'HAZARDOUS']);

const CreateBinRequestSchema = z.object({
  bin_name: z.string().min(1, 'Bin name is required'),
  bin_type: BinTypeEnum,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  capacity_kg: z.number().positive().optional(),
});

const UpdateBinRequestSchema = z.object({
  bin_name: z.string().min(1).optional(),
  bin_type: BinTypeEnum.optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  capacity_kg: z.number().positive().optional(),
});

const RecordCollectionRequestSchema = z.object({
  collected_weight: z.number().positive().optional(),
});

const BinIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const BinSchema = z.object({
  id: z.number(),
  bin_name: z.string(),
  bin_type: BinTypeEnum,
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().nullable(),
  capacity_kg: z.number().nullable(),
  last_collected_at: z.string(),
  total_collected_weight: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

const BinWithDistanceSchema = BinSchema.extend({
  numericDistance: z.number(),
  distance: z.string(),
});

const BinsResponseSchema = z.object({
  bins: z.array(BinSchema),
});

const BinResponseSchema = z.object({
  bin: BinSchema,
});

const NearestBinsResponseSchema = z.object({
  bins: z.array(BinWithDistanceSchema),
});

const BinStatsResponseSchema = z.object({
  stats: z.object({
    totalBins: z.number(),
    byType: z.array(
      z.object({
        bin_type: BinTypeEnum,
        _count: z.object({
          id: z.number(),
        }),
      })
    ),
  }),
});

const getAllBinsRoute = createGetRoute({
  path: '/bins',
  summary: 'Get all bins with optional filters',
  responseSchema: BinsResponseSchema,
  tags: ['Bins'],
});

const getBinByIdRoute = createGetRoute({
  path: '/bins/{id}',
  summary: 'Get bin by ID',
  responseSchema: BinResponseSchema,
  params: BinIdParamSchema,
  tags: ['Bins'],
});

const createBinRoute = createPostRoute({
  path: '/bins',
  summary: 'Create a new bin location',
  requestSchema: CreateBinRequestSchema,
  responseSchema: BinResponseSchema,
  tags: ['Bins'],
});

const deleteBinRoute = createDeleteRoute({
  path: '/bins/{id}',
  summary: 'Delete a bin',
  params: BinIdParamSchema,
  tags: ['Bins'],
});

const getNearestBinsRoute = createGetRoute({
  path: '/bins/nearest',
  summary: 'Find nearest bins to a location',
  responseSchema: NearestBinsResponseSchema,
  tags: ['Bins', 'Location'],
});

const getNearbyBinsRoute = createGetRoute({
  path: '/bins/nearby',
  summary: 'Find nearby bins with filters',
  responseSchema: NearestBinsResponseSchema,
  tags: ['Bins', 'Location'],
});

const getBinStatsRoute = createGetRoute({
  path: '/bins/stats',
  summary: 'Get bin statistics',
  responseSchema: BinStatsResponseSchema,
  tags: ['Bins', 'Analytics'],
});

export const BinSchemas = {
  CreateBinRequestSchema,
  UpdateBinRequestSchema,
  RecordCollectionRequestSchema,
  BinSchema,
  BinWithDistanceSchema,
  BinsResponseSchema,
  BinResponseSchema,
  NearestBinsResponseSchema,
  BinStatsResponseSchema,
  BinTypeEnum,
  getAllBinsRoute,
  getBinByIdRoute,
  createBinRoute,
  deleteBinRoute,
  getNearestBinsRoute,
  getNearbyBinsRoute,
  getBinStatsRoute,
};
