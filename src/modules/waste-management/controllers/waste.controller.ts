import type { Context } from 'hono';
import { WasteService } from '../services';
import { successResponse } from '@/utils/response';

const getWasteTypes = async (c: Context) => {
  const wasteTypes = await WasteService.getWasteTypes();
  return successResponse(c, { wasteTypes });
};

const logWaste = async (c: Context) => {
  const user = c.get('user');
  const body = await c.req.json();
  const data = {
    ...body,
    user_id: user.userId,
  };
  const result = await WasteService.logWaste(data);
  return successResponse(c, result.data, 201, result.message);
};

const getWasteStats = async (c: Context) => {
  const user = c.get('user');
  const query = c.req.query();

  const month = query.month ? Number(query.month) : undefined;
  const year = query.year ? Number(query.year) : undefined;

  const stats = await WasteService.getMonthlyStats(user.userId, month, year);
  return successResponse(c, { stats });
};

const getDailyStats = async (c: Context) => {
  const user = c.get('user');
  const query = c.req.query();

  const date = query.date ? new Date(query.date) : new Date();

  const stats = await WasteService.getDailyStats(user.userId, date);
  return successResponse(c, { stats });
};

const deleteLogById = async (c: Context) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const result = await WasteService.deleteLogById(id, user.userId);
  return successResponse(c, null, 200, result.message);
};

export { getWasteTypes, logWaste, getWasteStats, getDailyStats, deleteLogById };
