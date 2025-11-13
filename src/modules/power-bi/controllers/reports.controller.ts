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
  const { title, description, category, embedUrl, visibility, type } =
    body || {};
  if (!title || !category || !embedUrl) {
    return c.json({ error: 'title, category, and embedUrl are required' }, 400);
  }
  const created = await ReportsService.createReportMetadata({
    title,
    description,
    category,
    embedUrl,
    visibility,
    type,
  });
  return successResponse(c, { report: created });
};

// Update report metadata (admin)
const updateReport = async (c: Context) => {
  const reportId = parseInt(c.req.param('id') || '0', 10);
  if (!reportId || isNaN(reportId)) {
    return c.json({ error: 'Valid report ID is required' }, 400);
  }

  const body = await c.req.json().catch(() => ({}));
  const { title, description, category, embedUrl, visibility, type } =
    body || {};

  // At least one field must be provided for update
  if (
    !title &&
    description === undefined &&
    !category &&
    embedUrl === undefined &&
    visibility === undefined &&
    type === undefined
  ) {
    return c.json(
      {
        error:
          'At least one field (title, description, category, embedUrl, visibility, type) must be provided',
      },
      400
    );
  }

  const updated = await ReportsService.updateReportMetadata(reportId, {
    title,
    description,
    category,
    embedUrl,
    visibility,
    type,
  });
  return successResponse(c, { report: updated });
};

// Delete report metadata (admin)
const deleteReport = async (c: Context) => {
  const reportId = parseInt(c.req.param('id') || '0', 10);
  if (!reportId || isNaN(reportId)) {
    return c.json({ error: 'Valid report ID is required' }, 400);
  }

  await ReportsService.deleteReportMetadata(reportId);
  return successResponse(c, {
    message: `Report ${reportId} deleted successfully`,
  });
};

export { getReports, createReport, updateReport, deleteReport };
