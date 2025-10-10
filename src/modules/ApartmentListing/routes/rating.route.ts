import { Hono } from 'hono';
import * as RatingController from '../controllers/rating.Controller';

const RatingRoutes = new Hono();
RatingRoutes.get(
  '/apartment/:apartmentId/comments',
  RatingController.getCommentsByApartment
);
RatingRoutes.get(
  '/apartment/:apartmentId/average-rating',
  RatingController.getAverageRatingByApartment
);
RatingRoutes.get(
  '/overall-average-rating',
  RatingController.getOverallAverageRating
);
RatingRoutes.get('/', RatingController.getAllRatings);
RatingRoutes.post('/', RatingController.addRating);
RatingRoutes.patch('/', RatingController.updateRating);
RatingRoutes.delete('/', RatingController.deleteRating);
