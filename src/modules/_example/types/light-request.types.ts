import { z } from 'zod';
import { LightRequestSchemas } from '../schemas';

export type LightRequest = z.infer<
  typeof LightRequestSchemas.LightRequestSchema
>;
export type LightRequestResponse = z.infer<
  typeof LightRequestSchemas.LightRequestSchema
>;
export type CreateLightRequestDTO = z.infer<
  typeof LightRequestSchemas.CreateLightRequestSchema
>;
export type LightRequestFilters = z.infer<
  typeof LightRequestSchemas.LightRequestQuerySchema
>;
