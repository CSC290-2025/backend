import type { Context } from 'hono';
import { LightRequestService } from '../services';
import { successResponse } from '@/utils/response';

export const createLightRequest = async (c: Context) => {
  const body = await c.req.json();
  const result = await LightRequestService.createLightRequest(body);
  return successResponse(c, result, 200);
};

export const getLightRequests = async (c: Context) => {
  const query = c.req.query();

  const filters = {
    traffic_light_id: query.traffic_light_id
      ? Number(query.traffic_light_id)
      : undefined,
    start_date: query.start_date || undefined,
    end_date: query.end_date || undefined,
  };

  const pagination = {
    page: query.page ? Number(query.page) : 1,
    per_page: query.per_page ? Number(query.per_page) : 50,
  };

  const result = await LightRequestService.getLightRequests(
    { ...filters, ...pagination },
    pagination
  );
  return successResponse(c, result);
};
