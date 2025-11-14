import type { Context } from 'hono';
import { VehicleService } from '../services';
import { successResponse } from '@/utils/response';

export const updateVehicleLocation = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const result = await VehicleService.updateVehicleLocation(id, body);
  return successResponse(c, result);
};

export const getVehicle = async (c: Context) => {
  const id = Number(c.req.param('id'));
  const result = await VehicleService.getVehicle(id);
  return successResponse(c, result);
};
