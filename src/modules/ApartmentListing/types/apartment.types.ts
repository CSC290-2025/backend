import type { z } from 'zod';
import type { ApartmentSchemas } from '../schemas';

type Apartment = z.infer<typeof ApartmentSchemas.ApartmentSchema>;
type createApartmentData = z.infer<
  typeof ApartmentSchemas.createApartmentSchema
>;
type updateApartmentData = z.infer<
  typeof ApartmentSchemas.updateApartmentSchema
>;
type ApartmentFilter = z.infer<typeof ApartmentSchemas.ApartmentFilterSchema>;

export type {
  Apartment,
  createApartmentData,
  updateApartmentData,
  ApartmentFilter,
};
