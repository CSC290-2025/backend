import { RatingSchemas } from '../schemas';
import * as RatingController from '../controllers/rating.Controller';
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupRatingRoutes = (app: OpenAPIHono) => {
  app.openapi(
    RatingSchemas.createRatingRoute,
    RatingController.createRatingController
  );
  app.openapi(
    RatingSchemas.getAverageRatingByApartmentRoute,
    RatingController.getAverageRatingByApartment
  );
  app.openapi(
    RatingSchemas.updateRatingRoute,
    RatingController.updateRatingController
  );
  app.openapi(
    RatingSchemas.deleteRatingRoute,
    RatingController.deleteRatingController
  );
  app.openapi(
    RatingSchemas.getCommentsByApartmentRoute,
    RatingController.getCommentsByApartment
  );
  app.openapi(
    RatingSchemas.getAverageRatingByApartmentRoute,
    RatingController.getAverageRatingByApartment
  );
  app.openapi(RatingSchemas.getAllRatingsRoute, RatingController.getAllRatings);
};
export { setupRatingRoutes };
