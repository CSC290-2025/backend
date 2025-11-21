import type { Context } from 'hono';
import { BinService } from '../services';
import type { BinStatus, BinType } from '../types/bin.types';
import { successResponse } from '@/utils/response';

const getAllBins = async (c: Context) => {
  const query = c.req.query();

  const binType = isValidBinType(query.bin_type) ? query.bin_type : undefined;
  const status = isValidBinStatus(query.status) ? query.status : undefined;
  const lat = query.lat ? Number(query.lat) : undefined;
  const lng = query.lng ? Number(query.lng) : undefined;
  const radius = query.radius ? Number(query.radius) : undefined;

  const bins = await BinService.getAllBins({
    binType,
    status,
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

const createBin = async (c: Context) => {
  const body = await c.req.json();
  const result = await BinService.createBin(body);
  return successResponse(c, result.data, 201, result.message);
};

const updateBin = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const result = await BinService.updateBin(id, body);
  return successResponse(c, result.data, 200, result.message);
};

const deleteBin = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const result = await BinService.deleteBin(id);
  return successResponse(c, null, 200, result.message);
};

const updateBinStatus = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const result = await BinService.updateBinStatus(id, body.status);
  return successResponse(c, result.data, 200, result.message);
};

const recordCollection = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const result = await BinService.recordCollection(id, body.collected_weight);
  return successResponse(c, result.data, 200, result.message);
};

const getNearestBins = async (c: Context) => {
  const query = c.req.query();

  const lat = Number(query.lat);
  const lng = Number(query.lng);
  const binType = isValidBinType(query.bin_type) ? query.bin_type : undefined;
  const limit = query.limit ? Number(query.limit) : 5;

  const bins = await BinService.getNearestBins(lat, lng, binType, limit);
  return successResponse(c, { bins });
};

const getBinStats = async (c: Context) => {
  const stats = await BinService.getBinStats();
  return successResponse(c, { stats });
};

const BIN_TYPES: readonly BinType[] = [
  'RECYCLABLE',
  'GENERAL',
  'HAZARDOUS',
  'ORGANIC',
];
const BIN_STATUSES: readonly BinStatus[] = [
  'NORMAL',
  'OVERFLOW',
  'NEEDS_COLLECTION',
  'MAINTENANCE',
];

const isValidBinType = (value?: string): value is BinType => {
  if (!value) return false;
  return BIN_TYPES.includes(value as BinType);
};

const isValidBinStatus = (value?: string): value is BinStatus => {
  if (!value) return false;
  return BIN_STATUSES.includes(value as BinStatus);
};

export {
  getAllBins,
  getBinById,
  createBin,
  updateBin,
  deleteBin,
  updateBinStatus,
  recordCollection,
  getNearestBins,
  getBinStats,
};
