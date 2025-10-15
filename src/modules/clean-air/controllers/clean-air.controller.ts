import type { Context } from 'hono';
import {
  getDistricts as getDistrictsService,
  getDistrictDetail as getDistrictDetailService,
  getDistrictHistory as getDistrictHistoryService,
  getDistrictSummary as getDistrictSummaryService,
  searchDistricts as searchDistrictsService,
} from '../services';
import { ValidationError } from '@/errors';
import { successResponse } from '@/utils/response';

const getDistricts = async (c: Context) => {
  const limit = Number(c.req.query('limit')) || 0;
  const query = limit > 0 ? { limit } : {};

  const data = await getDistrictsService(query);
  return successResponse(c, { districts: data });
};

const getDistrictDetail = async (c: Context) => {
  const district = c.req.param('district');
  const data = await getDistrictDetailService(district);
  return successResponse(c, { district: data });
};

const getDistrictHistory = async (c: Context) => {
  const district = c.req.param('district');

  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const data = await getDistrictHistoryService(district);
  return successResponse(c, { history: data });
};

const getDistrictSummary = async (c: Context) => {
  const district = c.req.param('district');

  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const data = await getDistrictSummaryService(district);
  return successResponse(c, { summary: data });
};

const searchDistricts = async (c: Context) => {
  const q = c.req.query('q');

  if (!q) {
    throw new ValidationError('Search query is required');
  }

  const data = await searchDistrictsService({ q });
  return successResponse(c, { districts: data });
};

const getBangkokDistricts = async (c: Context) => {
  const data = await getDistrictsService();
  return successResponse(c, { districts: data });
};

export {
  getDistricts,
  getDistrictDetail,
  getDistrictHistory,
  getDistrictSummary,
  searchDistricts,
  getBangkokDistricts,
};
