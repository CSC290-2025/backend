import type { Context } from 'hono';
import { BinService } from '../services';
import type { BinType } from '../types/bin.types';
import { successResponse } from '@/utils/response';
import { UnauthorizedError } from '@/errors';

const getAllBins = async (c: Context) => {
  const query = c.req.query();

  const binType = isValidBinType(query.bin_type) ? query.bin_type : undefined;
  const lat = query.lat ? Number(query.lat) : undefined;
  const lng = query.lng ? Number(query.lng) : undefined;
  const radius = query.radius ? Number(query.radius) : undefined;

  const bins = await BinService.getAllBins({
    binType,
    lat,
    lng,
    radius,
  });

  return successResponse(c, { bins });
};

const getBinById = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const bin = await BinService.getBinById(id);
  return successResponse(c, { bin });
};

const getBinsByUser = async (c: Context) => {
  const user = c.get('user');
  const userId = user?.userId ?? user?.id;

  if (userId === undefined || userId === null) {
    throw new UnauthorizedError('User ID not found in authentication context');
  }

  const bins = await BinService.getBinsByUser(Number(userId));
  return successResponse(c, { bins });
};

const createBin = async (c: Context) => {
  const body = await c.req.json();
  const user = c.get('user');

  const userId = user?.userId ?? user?.id ?? null;

  const result = await BinService.createBin(body, userId);
  return successResponse(c, result.data, 201, result.message);
};

const deleteBin = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const user = c.get('user');

  const userId = user?.userId ?? user?.id;

  if (userId === undefined || userId === null) {
    throw new UnauthorizedError('User ID not found in authentication context');
  }

  const result = await BinService.deleteBin(id, userId);
  return successResponse(c, null, 200, result.message);
};

const getNearbyBins = async (c: Context) => {
  const query = c.req.query();

  const lat = Number(query.lat);
  const lng = Number(query.lng);
  const type =
    query.type === 'All'
      ? undefined
      : isValidBinType(query.type)
        ? query.type
        : undefined;
  const search = query.search || '';

  const bins = await BinService.getNearbyBins(lat, lng, type, search);
  return successResponse(c, { bins });
};

const BIN_TYPES: readonly BinType[] = ['RECYCLABLE', 'GENERAL', 'HAZARDOUS'];

const isValidBinType = (value?: string): value is BinType => {
  if (!value) return false;
  return BIN_TYPES.includes(value as BinType);
};

export {
  getAllBins,
  getBinById,
  getBinsByUser,
  createBin,
  deleteBin,
  getNearbyBins,
};
