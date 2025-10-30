import { Hono } from 'hono';
import * as RatingController from '../controllers/rating.Controller';

const ratingRoutes = new Hono();
ratingRoutes.get(
  '/apartment/:apartmentId/comments',
  RatingController.getCommentsByApartment
);
ratingRoutes.get(
  '/apartment/:apartmentId/average-rating',
  RatingController.getAverageRatingByApartment
);
ratingRoutes.get(
  '/overall-average-rating',
  RatingController.getOverallAverageRating
);
ratingRoutes.get('/', RatingController.getAllRatings);
ratingRoutes.post('/', RatingController.addRating);
ratingRoutes.patch('/', RatingController.updateRating);
ratingRoutes.delete('/', RatingController.deleteRating);

export { ratingRoutes };
