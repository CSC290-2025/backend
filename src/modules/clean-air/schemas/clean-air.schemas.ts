import { z } from '@hono/zod-openapi';
import {
  createGetRoute,
  createPostRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { authMiddleware } from '@/middlewares';

const CLEAN_AIR_TAG = ['Clean Air'];

const AirQualityCategorySchema = z
  .enum([
    'GOOD',
    'MODERATE',
    'UNHEALTHY_FOR_SENSITIVE',
    'UNHEALTHY',
    'VERY_UNHEALTHY',
    'HAZARDOUS',
  ])
  .openapi('AirQualityCategory');

const DistrictAirQualitySchema = z
  .object({
    province: z.string().openapi({ example: 'Bangkok' }),
    district: z.string().openapi({ example: 'Thung Khru' }),
    aqi: z.number().int().nonnegative().openapi({ example: 87 }),
    pm25: z.number().nonnegative().openapi({ example: 28.3 }),
    category: AirQualityCategorySchema,
    measured_at: z
      .string()
      .datetime({ offset: true })
      .openapi({ example: '2025-10-31T11:45:00.000Z' }),
  })
  .openapi('DistrictAirQuality');

const DistrictDetailDataSchema = z
  .object({
    aqi: z.number().int().nonnegative().openapi({ example: 95 }),
    pm25: z.number().nonnegative().openapi({ example: 32.1 }),
    pm10: z.number().nonnegative().openapi({ example: 48.4 }),
    co: z.number().nonnegative().openapi({ example: 0.6 }),
    no2: z.number().nonnegative().openapi({ example: 0.02 }),
    so2: z.number().nonnegative().openapi({ example: 0.01 }),
    o3: z.number().nonnegative().openapi({ example: 0.03 }),
    category: AirQualityCategorySchema,
    measured_at: z
      .string()
      .datetime({ offset: true })
      .openapi({ example: '2025-10-31T11:30:00.000Z' }),
  })
  .openapi('DistrictDetailData');

const DistrictDetailSchema = z
  .object({
    district: z.string().openapi({ example: 'thung khru' }),
    currentData: DistrictDetailDataSchema,
    address: z
      .object({
        province: z.string().openapi({ example: 'Bangkok' }),
        district: z.string().openapi({ example: 'Thung Khru' }),
      })
      .openapi('DistrictAddress'),
    coordinates: z
      .object({
        lat: z.number().openapi({ example: 13.63216 }),
        lng: z.number().openapi({ example: 100.49119 }),
      })
      .openapi('DistrictCoordinates'),
  })
  .openapi('DistrictDetail');

const DistrictHistorySchema = z
  .object({
    district: z.string().openapi({ example: 'thung khru' }),
    period: z.string().openapi({ example: '7 days' }),
    history: z.array(DistrictDetailDataSchema),
  })
  .openapi('DistrictHistory');

const DistrictSummarySchema = z
  .object({
    district: z.string().openapi({ example: 'thung khru' }),
    period: z.string().openapi({ example: '7 days' }),
    summary: z
      .object({
        average: z
          .object({
            aqi: z.number().int().openapi({ example: 92 }),
            pm25: z.number().openapi({ example: 30.5 }),
            pm10: z.number().openapi({ example: 44.2 }),
          })
          .openapi('SummaryAverage'),
        maximum: z
          .object({
            aqi: z.number().int().openapi({ example: 110 }),
            pm25: z.number().openapi({ example: 37.9 }),
            pm10: z.number().openapi({ example: 52.1 }),
          })
          .openapi('SummaryMaximum'),
        minimum: z
          .object({
            aqi: z.number().int().openapi({ example: 70 }),
            pm25: z.number().openapi({ example: 18.4 }),
            pm10: z.number().openapi({ example: 32.7 }),
          })
          .openapi('SummaryMinimum'),
        trend: z
          .object({
            aqi_change: z.number().int().openapi({ example: -6 }),
            description: z.string().openapi({ example: 'Slightly improved' }),
          })
          .openapi('SummaryTrend'),
      })
      .openapi('DistrictSummaryValues'),
  })
  .openapi('DistrictSummary');

const HealthTipsSchema = z
  .object({
    tips: z
      .array(
        z
          .string()
          .min(1)
          .max(200)
          .openapi({ example: 'Wear a well-fitted mask for outdoor travel.' })
      )
      .min(1)
      .max(3),
  })
  .openapi('HealthTipsResponse');

const SearchDistrictsResponseSchema = z
  .object({
    districts: z.array(DistrictAirQualitySchema),
  })
  .openapi('SearchDistrictsResponse');

const DistrictsListResponseSchema = z
  .object({
    districts: z.array(DistrictAirQualitySchema),
  })
  .openapi('DistrictsListResponse');

const Air4ThaiDistrictsResponseSchema = z
  .object({
    districts: z.array(DistrictAirQualitySchema),
  })
  .openapi('Air4ThaiDistrictsResponse');

const DistrictDetailResponseSchema = z
  .object({
    detail: DistrictDetailSchema,
  })
  .openapi('DistrictDetailResponse');

const DistrictHistoryResponseSchema = z
  .object({
    history: DistrictHistorySchema,
  })
  .openapi('DistrictHistoryResponse');

const DistrictSummaryResponseSchema = z
  .object({
    summary: DistrictSummarySchema,
  })
  .openapi('DistrictSummaryResponse');

const DistrictParamSchema = z.object({
  district: z
    .string()
    .min(1)
    .openapi({
      param: {
        name: 'district',
        in: 'path',
        required: true,
        description: 'District name (case-insensitive).',
      },
      example: 'Thung Khru',
    }),
});

const SearchDistrictsQuerySchema = z.object({
  q: z
    .string()
    .min(1)
    .openapi({
      param: {
        name: 'q',
        in: 'query',
        required: true,
        description: 'Search term for district names (case-insensitive).',
      },
      example: 'thon',
    }),
});

const getDistrictsRoute = createGetRoute({
  path: '/clean-air/districts',
  summary: 'List Bangkok district air quality data from Open-Meteo',
  responseSchema: DistrictsListResponseSchema,
  tags: CLEAN_AIR_TAG,
});

const getDistrictDetailRoute = createGetRoute({
  path: '/clean-air/districts/{district}',
  summary: 'Get detailed air quality for a Bangkok district',
  params: DistrictParamSchema,
  responseSchema: DistrictDetailResponseSchema,
  tags: CLEAN_AIR_TAG,
});

const getDistrictHistoryRoute = createGetRoute({
  path: '/clean-air/districts/{district}/history',
  summary: 'Get 7-day air quality history for a Bangkok district',
  params: DistrictParamSchema,
  responseSchema: DistrictHistoryResponseSchema,
  tags: CLEAN_AIR_TAG,
});

const getDistrictSummaryRoute = createGetRoute({
  path: '/clean-air/districts/{district}/summary',
  summary: 'Summarise 7-day air quality trends for a Bangkok district',
  params: DistrictParamSchema,
  responseSchema: DistrictSummaryResponseSchema,
  tags: CLEAN_AIR_TAG,
});

const getDistrictHealthTipsRoute = createGetRoute({
  path: '/clean-air/districts/{district}/health-tips',
  summary: 'Generate three health tips for the current air quality',
  params: DistrictParamSchema,
  responseSchema: HealthTipsSchema,
  tags: CLEAN_AIR_TAG,
});

const getAir4ThaiDistrictsRoute = createGetRoute({
  path: '/clean-air/air4thai/districts',
  summary: 'List Bangkok district air quality data from Air4Thai',
  responseSchema: Air4ThaiDistrictsResponseSchema,
  tags: CLEAN_AIR_TAG,
});

const searchDistrictsRoute = createGetRoute({
  path: '/clean-air/search',
  summary: 'Search Bangkok districts by name',
  query: SearchDistrictsQuerySchema,
  responseSchema: SearchDistrictsResponseSchema,
  tags: CLEAN_AIR_TAG,
});

const FavouriteDistrictsResponseSchema = z
  .object({ favorites: z.array(DistrictAirQualitySchema) })
  .openapi('FavouriteDistrictsResponse');

const FavouriteDistrictResponseSchema = z
  .object({ favorite: DistrictAirQualitySchema })
  .openapi('FavouriteDistrictResponse');

const FavouriteDistrictParamSchema = z.object({
  district: z
    .string()
    .min(1)
    .openapi({
      param: {
        name: 'district',
        in: 'path',
        required: true,
        description: 'District name (case-insensitive).',
      },
      example: 'Thung Khru',
    }),
});

const getFavouriteDistrictsRoute = createGetRoute({
  path: '/clean-air/favorites',
  summary: 'List user favourite Bangkok districts',
  responseSchema: FavouriteDistrictsResponseSchema,
  tags: CLEAN_AIR_TAG,
  middleware: [authMiddleware],
});

const addFavouriteDistrictRoute = createPostRoute({
  path: '/clean-air/favorites/{district}',
  summary: 'Add a district to favourites',
  params: FavouriteDistrictParamSchema,
  requestSchema: z.object({}),
  responseSchema: FavouriteDistrictResponseSchema,
  tags: CLEAN_AIR_TAG,
  middleware: [authMiddleware],
});

const removeFavouriteDistrictRoute = createDeleteRoute({
  path: '/clean-air/favorites/{district}',
  summary: 'Remove a district from favourites',
  params: FavouriteDistrictParamSchema,
  tags: CLEAN_AIR_TAG,
  middleware: [authMiddleware],
});

export {
  AirQualityCategorySchema,
  DistrictAirQualitySchema,
  DistrictDetailDataSchema,
  DistrictDetailSchema,
  DistrictHistorySchema,
  DistrictSummarySchema,
  HealthTipsSchema,
  SearchDistrictsQuerySchema,
  DistrictsListResponseSchema,
  DistrictDetailResponseSchema,
  DistrictHistoryResponseSchema,
  DistrictSummaryResponseSchema,
  Air4ThaiDistrictsResponseSchema,
  getDistrictsRoute,
  getDistrictDetailRoute,
  getDistrictHistoryRoute,
  getDistrictSummaryRoute,
  getDistrictHealthTipsRoute,
  getAir4ThaiDistrictsRoute,
  searchDistrictsRoute,
  FavouriteDistrictsResponseSchema,
  FavouriteDistrictResponseSchema,
  getFavouriteDistrictsRoute,
  addFavouriteDistrictRoute,
  removeFavouriteDistrictRoute,
};
