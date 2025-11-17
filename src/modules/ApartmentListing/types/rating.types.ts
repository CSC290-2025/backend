import type { RatingSchemas } from '../schemas/rating.schema';
import type { z } from 'zod';

type Rating = z.infer<typeof RatingSchemas.RatingSchema>;
type RatingList = z.infer<typeof RatingSchemas.RatingListSchema>;
type createRatingData = z.infer<typeof RatingSchemas.createRatingSchema>;
type updateRatingData = z.infer<typeof RatingSchemas.updateRatingSchema>;

export type { Rating, RatingList, createRatingData, updateRatingData };
