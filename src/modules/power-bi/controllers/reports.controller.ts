import type { Context } from 'hono';
import { ReportsService } from '../services';
import { successResponse } from '@/utils/response';
import { UnauthorizedError, ValidationError } from '@/errors';
import config from '@/config/env';

const ADMIN_ROLE_ID = config.adminRoleId;

const getAllReports = async (c: Context) => {
  const allReports = await ReportsService.getReportsMetadata();
  return successResponse(c, { reports: allReports });
};

// Reports listing (metadata-driven across categories, filtered by role)
const getReports = async (c: Context) => {
  const user = c.get('user');
  const role = user.roleId === ADMIN_ROLE_ID ? 'admin' : 'citizens';
  const queryRole = c.req.query('role');

  if (queryRole != role) {
    throw new UnauthorizedError(
      'You are not authorized to access reports for this role'
    );
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
    throw new ValidationError('title, category, and embedUrl are required');
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
    throw new ValidationError('Valid report ID is required');
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
    throw new ValidationError(
      'At least one field (title, description, category, embedUrl, visibility, type) must be provided'
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
    throw new ValidationError('Valid report ID is required');
  }

  await ReportsService.deleteReportMetadata(reportId);
  return successResponse(c, {
    message: `Report ${reportId} deleted successfully`,
  });
};

export { getAllReports, getReports, createReport, updateReport, deleteReport };
