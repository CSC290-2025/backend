import type { Context } from 'hono';
import { WasteService } from '../services';
import { successResponse } from '@/utils/response';

const getWasteTypes = async (c: Context) => {
  const wasteTypes = await WasteService.getWasteTypes();
  return successResponse(c, { wasteTypes });
};

const logWaste = async (c: Context) => {
  const body = await c.req.json();
  const result = await WasteService.logWaste(body);
  return successResponse(c, result.data, 201, result.message);
};

const getWasteStats = async (c: Context) => {
  const query = c.req.query();

  const month = query.month ? Number(query.month) : undefined;
  const year = query.year ? Number(query.year) : undefined;

  const stats = await WasteService.getMonthlyStats(month, year);
  return successResponse(c, { stats });
};

const getDailyStats = async (c: Context) => {
  const query = c.req.query();

  const date = query.date ? new Date(query.date) : new Date();

  const stats = await WasteService.getDailyStats(date);
  return successResponse(c, { stats });
};

export { getWasteTypes, logWaste, getWasteStats, getDailyStats };
