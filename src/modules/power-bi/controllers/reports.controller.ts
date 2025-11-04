import type { Context } from 'hono';
import { ReportsService } from '../services';
import { successResponse } from '@/utils/response';

// Reports listing (metadata-driven across categories, filtered by role)
const getReports = async (c: Context) => {
  const role = c.req.query('role');

  if (!role) {
    return c.json({ error: 'role query parameter is required' }, 400);
  }

  const reportsByCategory = await ReportsService.getReportsByRole(role);
  return successResponse(c, { reports: reportsByCategory });
};

// Create report metadata (admin)
const createReport = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { title, description, category, embedUrl } = body || {};
  if (!title || !category || !embedUrl) {
    return c.json({ error: 'title, category, and embedUrl are required' }, 400);
  }
  const created = await ReportsService.createReportMetadata({
    title,
    description,
    category,
    embedUrl,
  });
  return successResponse(c, { report: created });
};

export { getReports, createReport };
