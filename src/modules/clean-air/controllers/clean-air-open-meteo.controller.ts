import type { Context } from 'hono';
import { ValidationError } from '@/errors';
import { successResponse } from '@/utils/response';
import { CleanAirService } from '../services';
import type { GetDistrictsQuery } from '../types';

const getDistricts = async (c: Context) => {
  let query: GetDistrictsQuery | undefined;
  const districts = await CleanAirService.getDistricts(query);
  return successResponse(c, { districts });
};

const getDistrictDetail = async (c: Context) => {
  const district = c.req.param('district');
  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const detail = await CleanAirService.getDistrictDetail(district);
  return successResponse(c, { detail });
};

const getDistrictHistory = async (c: Context) => {
  const district = c.req.param('district');
  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const history = await CleanAirService.getDistrictHistory(district);
  return successResponse(c, { history });
};

const getDistrictSummary = async (c: Context) => {
  const district = c.req.param('district');
  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const summary = await CleanAirService.getDistrictSummary(district);
  return successResponse(c, { summary });
};

const searchDistricts = async (c: Context) => {
  const q = c.req.query('q');
  if (!q) {
    throw new ValidationError('Search query is required');
  }

  const districts = await CleanAirService.searchDistricts({ q });
  return successResponse(c, { districts });
};

const getDistrictHealthTips = async (c: Context) => {
  const district = c.req.param('district');
  if (!district) {
    throw new ValidationError('District parameter is required');
  }

  const tips = await CleanAirService.getHealthTips(district);
  return successResponse(c, { tips });
};

export {
  getDistricts,
  getDistrictDetail,
  getDistrictHistory,
  getDistrictSummary,
  searchDistricts,
  getDistrictHealthTips,
};
