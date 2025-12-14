import type { Context, Handler } from 'hono';
import { ReportService } from '@/modules/emergency/services';
import { successResponse } from '@/utils/response.ts';
import type { ReportStatus } from '@/modules/emergency/schemas/branded.schema.ts';

export const createReport = async (c: Context) => {
  const body = await c.req.json();
  const report = await ReportService.createReport(body);
  return successResponse(c, { report }, 201, 'Create report successfully');
};

export const findReportByStatus: Handler = async (c: Context) => {
  const statusParam = c.req.param('status');

  const { _page, _limit } = c.req.query();
  const page = Number(_page);
  const limit = Number(_limit);

  const { report, totalCount } = await ReportService.findReportByStatus(
    statusParam as ReportStatus,
    page,
    limit
  );
  c.header('Access-Control-Expose-Headers', 'x-total-count');
  c.header('x-total-count', totalCount.toString());
  return successResponse(
    c,
    { report },
    201,
    'Find report by status successfully'
  );
};

export const updateReportById = async (c: Context) => {
  const { id } = c.req.param();
  const data = await c.req.json();

  const report = await ReportService.updateReportById(Number(id), data);
  return successResponse(c, { report }, 200, 'Report updated successfully');
};

export const deleteReportById = async (c: Context) => {
  const { id } = c.req.param();

  const report = await ReportService.deleteReportById(Number(id));
  return successResponse(
    c,
    { id_delete: report.id },
    200,
    'Report deleted successfully'
  );
};
