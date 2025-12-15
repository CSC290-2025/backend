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

// Schema for updating a place
const latLongSchema = z.object({
  lat: z.string().optional(),
  lon: z.string().optional(),
});

// openAPI
//note to self: id = apartmentid
const CreatePlaceRoute = createPostRoute({
  path: '/places',
  summary: 'Create a new place',
  requestSchema: z.object({ q: z.string() }),
  responseSchema: PlaceSchema,
  tags: ['Place'],
  middleware: [authMiddleware],
});

const UpdatePlaceRoute = createPutRoute({
  path: '/places/{id}',
  summary: 'Update an existing place',
  requestSchema: latLongSchema,
  responseSchema: PlaceSchema,
  tags: ['Place'],
  middleware: [authMiddleware],
});

const getAPTCoordRoute = createGetRoute({
  path: '/places/{id}',
  summary: 'Get a place by ID',
  params: z.object({ id: z.coerce.number().int().positive() }),
  responseSchema: latLongSchema,
  tags: ['Place'],
  middleware: [authMiddleware],
});

export const LocationIQSchemas = {
  latLongSchema,
  PlaceSchema,
  CreatePlaceRoute,
  UpdatePlaceRoute,
  getAPTCoordRoute,
  PlaceListSchema,
};
