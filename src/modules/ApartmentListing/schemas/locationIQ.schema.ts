import { authMiddleware } from '@/middlewares';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
} from '@/utils/openapi-helpers';
import { z } from 'zod';
// Base Schema for the Place object
const PlaceSchema = z.object({
  place_id: z.string(),
  licence: z.string(),
  osm_type: z.enum(['node', 'way', 'relation', 'unknown']).or(z.string()),
  osm_id: z.string(),
  boundingbox: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
  class: z.string(),
  type: z.string(),
  importance: z.number(),
  icon: z.string().url().optional().nullable(),
});

const PlaceListSchema = z.array(PlaceSchema);

// Schema for lat/long coordinates
const latLongSchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
});

const NearbyPlacesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).default(13.65098),
  lon: z.coerce.number().min(-180).max(180).default(100.49644),
  radius: z.coerce.number().int().min(1).max(30000).default(1000),
  tag: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
});
const getDistanceSchema = z.object({
  lat1: z.coerce.number().min(-90).max(90).default(13.65098),
  lon1: z.coerce.number().min(-180).max(180).default(100.49644),
  lat2: z.coerce.number().min(-90).max(90).default(13.64754),
  lon2: z.coerce.number().min(-180).max(180).default(100.4984047),
});

// openAPI
const UpdatePlaceRoute = createPutRoute({
  path: '/LocationIQ/{id}',
  summary: 'Update an existing coord',
  requestSchema: latLongSchema,
  responseSchema: PlaceSchema,
  tags: ['LocationIQ'],
  middleware: [authMiddleware],
});

const getAPTCoordRoute = createGetRoute({
  path: '/LocationIQ',
  summary: 'Get a coord by query',
  query: z.object({
    q: z
      .string()
      .default('126 Pracha Uthit Rd, Bang Mot, Thung Khru, Bangkok 10140'),
  }),
  responseSchema: latLongSchema,
  tags: ['LocationIQ'],
  middleware: [authMiddleware],
});

const getNearbyPlacesRoute = createGetRoute({
  path: '/LocationIQ/nearby',
  summary:
    'Get nearby places by lat and lon, excluding hospitals, banks, atms, and pharmacies',
  query: NearbyPlacesQuerySchema,
  responseSchema: PlaceListSchema,
  tags: ['LocationIQ'],
  middleware: [authMiddleware],
});

const getDistanceRoute = createGetRoute({
  path: '/LocationIQ/distance',
  summary: 'Get distance between two coordinates',
  query: getDistanceSchema,
  responseSchema: z.object({ distance: z.number() }),
  tags: ['LocationIQ'],
  middleware: [authMiddleware],
});

export const LocationIQSchemas = {
  latLongSchema,
  PlaceSchema,
  getNearbyPlacesRoute,
  UpdatePlaceRoute,
  getAPTCoordRoute,
  PlaceListSchema,
  NearbyPlacesQuerySchema,
  getDistanceSchema,
  getDistanceRoute,
};
