import type { Context } from 'hono';
import { ValidationError, UnauthorizedError } from '@/errors';
import { successResponse } from '@/utils/response';
import { CleanAirService } from '../services';

const getDistricts = async (c: Context) => {
  const districts = await CleanAirService.getDistricts();
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

const requireUserId = (c: Context) => {
  const user = c.get('user') as { id?: number } | undefined;
  const userId = user?.id;
  if (!userId) {
    throw new UnauthorizedError('User is not authenticated');
  }
  return userId;
};

const getFavoriteDistricts = async (c: Context) => {
  const userId = requireUserId(c);
  const favorites = await CleanAirService.getFavoriteDistricts(userId);
  return successResponse(c, { favorites });
};

const addFavoriteDistrict = async (c: Context) => {
  const userId = requireUserId(c);
  const district = c.req.param('district');
  if (!district) throw new ValidationError('District parameter is required');
  const favorite = await CleanAirService.addFavoriteDistrict(userId, district);
  return successResponse(c, { favorite }, 201);
};

const removeFavoriteDistrict = async (c: Context) => {
  const userId = requireUserId(c);
  const district = c.req.param('district');
  if (!district) throw new ValidationError('District parameter is required');
  await CleanAirService.removeFavoriteDistrict(userId, district);
  return successResponse(c, { success: true });
};

export {
  getDistricts,
  getDistrictDetail,
  getDistrictHistory,
  getDistrictSummary,
  searchDistricts,
  getDistrictHealthTips,
  getFavoriteDistricts,
  addFavoriteDistrict,
  removeFavoriteDistrict,
};
