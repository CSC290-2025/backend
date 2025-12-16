import type { OpenAPIHono } from '@hono/zod-openapi';
import { CleanAirController, Air4ThaiController } from '../controllers';
import { CleanAirSchemas } from '../schemas';

const setupCleanAirRoutes = (app: OpenAPIHono) => {
  app.openapi(
    CleanAirSchemas.getDistrictsRoute,
    CleanAirController.getDistricts
  );
  app.openapi(
    CleanAirSchemas.getDistrictDetailRoute,
    CleanAirController.getDistrictDetail
  );
  app.openapi(
    CleanAirSchemas.getDistrictHistoryRoute,
    CleanAirController.getDistrictHistory
  );
  app.openapi(
    CleanAirSchemas.getDistrictSummaryRoute,
    CleanAirController.getDistrictSummary
  );
  app.openapi(
    CleanAirSchemas.getDistrictHealthTipsRoute,
    CleanAirController.getDistrictHealthTips
  );
  app.openapi(
    CleanAirSchemas.searchDistrictsRoute,
    CleanAirController.searchDistricts
  );
  app.openapi(
    CleanAirSchemas.getAir4ThaiDistrictsRoute,
    Air4ThaiController.getBangkokDistrictAQI
  );
  app.openapi(
    CleanAirSchemas.getFavouriteDistrictsRoute,
    CleanAirController.getFavoriteDistricts
  );
  app.openapi(
    CleanAirSchemas.addFavouriteDistrictRoute,
    CleanAirController.addFavoriteDistrict
  );
  app.openapi(
    CleanAirSchemas.removeFavouriteDistrictRoute,
    CleanAirController.removeFavoriteDistrict
  );
};

export { setupCleanAirRoutes };
