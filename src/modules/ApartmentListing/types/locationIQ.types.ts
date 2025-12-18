import type { z } from 'zod';
import type { LocationIQSchemas } from '../schemas';

type PlaceType = z.infer<typeof LocationIQSchemas.PlaceSchema>;
type PlaceListType = z.infer<typeof LocationIQSchemas.PlaceListSchema>;
type latLongType = z.infer<typeof LocationIQSchemas.latLongSchema>;
type NearbyPlacesQueryType = z.infer<
  typeof LocationIQSchemas.NearbyPlacesQuerySchema
>;
type getDistanceType = z.infer<typeof LocationIQSchemas.getDistanceSchema>;

export type {
  PlaceType,
  latLongType,
  PlaceListType,
  NearbyPlacesQueryType,
  getDistanceType,
};
