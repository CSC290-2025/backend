import { createGetRoute } from '@/utils/openapi-helpers';
import { authMiddleware } from '@/middlewares';
import { z } from 'zod';

const AddressSchema = z.object({
  name: z.string().optional(),
  house_number: z.string().optional(),
  road: z.string().optional(),
  neighbourhood: z.string().optional(),
  suburb: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  country_code: z.string().optional(),
});

const LocationIQItemSchema = z.object({
  place_id: z.string(),
  osm_id: z.string().optional(),
  osm_type: z.string().optional(),
  licence: z.string().optional(),
  lat: z.string().transform((str) => parseFloat(str)),
  lon: z.string().transform((str) => parseFloat(str)),
  boundingbox: z.array(z.string()).optional(),
  class: z.string(),
  type: z.string(),
  tag_type: z.string().optional(),
  name: z.string().optional(),
  display_name: z.string(),
  address: AddressSchema,
  distance: z.number().int().optional(),
});

const LocationIQResponseSchema = z.array(LocationIQItemSchema);

const WrappedPlaceSchema = z.object({
  name: z.string().nullable(),
  type: z.string(),
  lat: z.number(),
  lon: z.number(),
  distance: z.number().int().nullable(),
});

const NearbyPlacesResponseSchema = z.object({
  places: z.array(WrappedPlaceSchema),
});

const NearbyPlacesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).default(13.65098),
  lon: z.coerce.number().min(-180).max(180).default(100.49644),
  radius: z.coerce.number().int().min(1).max(30000).default(1000),
  tag: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
});

const getNearbyPlacesRoute = createGetRoute({
  path: '/nearby',
  summary: 'Get nearby places using latitude, longitude, and radius',
  query: NearbyPlacesQuerySchema,
  responseSchema: NearbyPlacesResponseSchema,
  tags: ['LocationIQ'],
  middleware: [authMiddleware],
  operationId: 'GetNearbyPlaces',
});

export const LocationSchemas = {
  AddressSchema,
  LocationIQItemSchema,
  LocationIQResponseSchema,
  WrappedPlaceSchema,
  NearbyPlacesResponseSchema,
  NearbyPlacesQuerySchema,
  getNearbyPlacesRoute,
};
