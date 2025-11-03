import type { Context } from 'hono';
import { ReportService } from '@/modules/emergency/services';
import { successResponse } from '@/utils/response.ts';
import type { ReportStatus } from '@/modules/emergency/schemas/branded.schema.ts';

export const createReport = async (c: Context) => {
  const body = await c.req.json();
  const report = await ReportService.createReport(body);
  return successResponse(c, { report }, 201, 'Create report successfully');
};

export const findReportByStatus = async (c: Context) => {
  const statusParam = c.req.param('status');

  const { _page, _limit } = c.req.query();
  const page = Number(_page);
  const limit = Number(_limit);

  const report = await ReportService.findReportByStatus(
    statusParam as ReportStatus,
    page,
    limit
  );
  return successResponse(
    c,
    { report },
    201,
    'Find report by status successfully'
  );
};
