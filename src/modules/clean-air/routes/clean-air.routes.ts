import { Hono } from 'hono';
import {
  getDistricts,
  getDistrictDetail,
  getDistrictHistory,
  getDistrictSummary,
  searchDistricts,
  getBangkokDistricts,
} from '../controllers';

const cleanAirRoutes = new Hono();

cleanAirRoutes.get('/districts', getDistricts);
cleanAirRoutes.get('/districts/:district', getDistrictDetail);
cleanAirRoutes.get('/districts/:district/history', getDistrictHistory);
cleanAirRoutes.get('/districts/:district/summary', getDistrictSummary);
cleanAirRoutes.get('/search', searchDistricts);
cleanAirRoutes.get('/bangkok', getBangkokDistricts);

export { cleanAirRoutes };
