import { Hono } from 'hono';
import { Air4ThaiController, CleanAirController } from '../controllers';

const cleanAirRoutes = new Hono();

cleanAirRoutes.get('/districts', CleanAirController.getDistricts);
cleanAirRoutes.get(
  '/districts/:district',
  CleanAirController.getDistrictDetail
);
cleanAirRoutes.get(
  '/districts/:district/history',
  CleanAirController.getDistrictHistory
);
cleanAirRoutes.get(
  '/districts/:district/summary',
  CleanAirController.getDistrictSummary
);
cleanAirRoutes.get(
  '/districts/:district/health-tips',
  CleanAirController.getDistrictHealthTips
);
cleanAirRoutes.get('/search', CleanAirController.searchDistricts);

cleanAirRoutes.get(
  '/air4thai/districts',
  Air4ThaiController.getBangkokDistrictAQI
);

export { cleanAirRoutes };
