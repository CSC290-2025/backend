import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

// Enums
const BinTypeEnum = z.enum(['RECYCLABLE', 'GENERAL', 'HAZARDOUS', 'ORGANIC']);
const BinStatusEnum = z.enum([
  'NORMAL',
  'OVERFLOW',
  'NEEDS_COLLECTION',
  'MAINTENANCE',
]);

// Request Schemas
const CreateBinRequestSchema = z.object({
  bin_name: z.string().min(1, 'Bin name is required'),
  bin_type: BinTypeEnum,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  capacity_kg: z.number().positive().optional(),
  status: BinStatusEnum.optional(),
});

const UpdateBinRequestSchema = z.object({
  bin_name: z.string().min(1).optional(),
  bin_type: BinTypeEnum.optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  capacity_kg: z.number().positive().optional(),
  status: BinStatusEnum.optional(),
});

const UpdateBinStatusRequestSchema = z.object({
  status: BinStatusEnum,
});

const RecordCollectionRequestSchema = z.object({
  collected_weight: z.number().positive().optional(),
});

// Params Schemas
const BinIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Response Schemas
const BinSchema = z.object({
  id: z.number(),
  bin_name: z.string(),
  bin_type: BinTypeEnum,
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().nullable(),
  capacity_kg: z.number().nullable(),
  status: BinStatusEnum,
  last_collected_at: z.string(),
  total_collected_weight: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

const BinWithDistanceSchema = BinSchema.extend({
  distance_km: z.number(),
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
    byStatus: z.array(
      z.object({
        status: BinStatusEnum,
        _count: z.object({
          id: z.number(),
        }),
      })
    ),
    overflowBins: z.number(),
  }),
});

// OpenAPI Route Definitions
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

const updateBinRoute = createPutRoute({
  path: '/bins/{id}',
  summary: 'Update bin information',
  requestSchema: UpdateBinRequestSchema,
  responseSchema: BinResponseSchema,
  params: BinIdParamSchema,
  tags: ['Bins'],
});

const deleteBinRoute = createDeleteRoute({
  path: '/bins/{id}',
  summary: 'Delete a bin',
  params: BinIdParamSchema,
  tags: ['Bins'],
});

const updateBinStatusRoute = createPutRoute({
  path: '/bins/{id}/status',
  summary: 'Update bin status',
  requestSchema: UpdateBinStatusRequestSchema,
  responseSchema: BinResponseSchema,
  params: BinIdParamSchema,
  tags: ['Bins'],
});

const recordCollectionRoute = createPostRoute({
  path: '/bins/{id}/collect',
  summary: 'Record a collection event for a bin',
  requestSchema: RecordCollectionRequestSchema,
  responseSchema: BinResponseSchema,
  params: BinIdParamSchema,
  tags: ['Bins'],
});

const getNearestBinsRoute = createGetRoute({
  path: '/bins/nearest',
  summary: 'Find nearest bins to a location',
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
  // Request Schemas
  CreateBinRequestSchema,
  UpdateBinRequestSchema,
  UpdateBinStatusRequestSchema,
  RecordCollectionRequestSchema,

  // Response Schemas
  BinSchema,
  BinWithDistanceSchema,
  BinsResponseSchema,
  BinResponseSchema,
  NearestBinsResponseSchema,
  BinStatsResponseSchema,

  // Enum Schemas
  BinTypeEnum,
  BinStatusEnum,

  // Route Definitions
  getAllBinsRoute,
  getBinByIdRoute,
  createBinRoute,
  updateBinRoute,
  deleteBinRoute,
  updateBinStatusRoute,
  recordCollectionRoute,
  getNearestBinsRoute,
  getBinStatsRoute,
};
