import type { z } from 'zod';
import type { WeatherRatingSchemas } from '../schemas';

export type WeatherRating = z.infer<
  typeof WeatherRatingSchemas.WeatherRatingSchema
>;
export type WeatherRatingCreateInput = z.infer<
  typeof WeatherRatingSchemas.WeatherRatingCreateSchema
>;
export type WeatherRatingAverageQuery = z.infer<
  typeof WeatherRatingSchemas.WeatherRatingAverageQuerySchema
>;
export type WeatherRatingAverageItem = z.infer<
  typeof WeatherRatingSchemas.WeatherRatingAverageItemSchema
>;
export type WeatherRatingUserQuery = z.infer<
  typeof WeatherRatingSchemas.WeatherRatingUserQuerySchema
>;
