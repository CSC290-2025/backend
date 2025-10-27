import type { Context } from 'hono';
import { ReportService } from '@/modules/emergency/services';
import { successResponse } from '@/utils/response.ts';

export const createReport = async (c: Context) => {
  const body = await c.req.json();
  const report = await ReportService.createReport(body);
  return successResponse(c, { report }, 201, 'Create reports successfully');
};
