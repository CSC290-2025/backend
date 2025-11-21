import { ReportsModel } from '../models';
import type {
  ReportMetadataWithEmbedUrl,
  CreateReportMetadataInput,
  UpdateReportMetadataInput,
  ReportsByCategory,
} from '../types';
import { VALID_ROLES } from '../types';
import { NotFoundError, ValidationError } from '@/errors';

const getReportsMetadata = async (): Promise<ReportMetadataWithEmbedUrl[]> => {
  const data = await ReportsModel.getReportsMetadata();
  if (!data) throw new NotFoundError('No reports metadata found');
  return data;
};

/**
 * Get reports organized by category, filtered by user role
 */
const getReportsByRole = async (role: string): Promise<ReportsByCategory> => {
  // Validate role parameter
  const normalizedRole = role.toLowerCase();
  if (!VALID_ROLES.includes(normalizedRole as (typeof VALID_ROLES)[number])) {
    throw new ValidationError(
      `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
    );
  }
  console.log('Fetching reports for role:', normalizedRole);

  // Get all reports with category information
  const reports = await ReportsModel.getReportsMetadataWithCategory();
  if (!reports || reports.length === 0) {
    return {};
  }

  // Filter reports based on visibility and role
  // - If role is "citizen", only show reports with visibility="citizens"
  // - If role is "admin", show reports with visibility="citizens" OR visibility="admin"
  const filteredReports = reports.filter((report) => {
    const reportVisibility = report.visibility?.toLowerCase();

    if (normalizedRole === 'citizens') {
      return reportVisibility === 'citizens';
    } else if (normalizedRole === 'admin') {
      return reportVisibility === 'citizens' || reportVisibility === 'admin';
    }

    // For other roles (e.g., 'official'), show all reports for now
    return true;
  });

  // Group reports by category
  const reportsByCategory: ReportsByCategory = {};

  filteredReports.forEach((report) => {
    const categoryName =
      report.dim_category?.category_name?.toLowerCase() || 'uncategorized';
    const categoryId = report.category_id || 0;
    const categoryDescription =
      report.dim_category?.category_description || null;

    if (!reportsByCategory[categoryName]) {
      reportsByCategory[categoryName] = {
        categoryId,
        categoryName: report.dim_category?.category_name || categoryName,
        categoryDescription,
        reports: [],
      };
    }

    reportsByCategory[categoryName].reports.push(report);
  });

  return reportsByCategory;
};

const createReportMetadata = async (
  record: CreateReportMetadataInput
): Promise<ReportMetadataWithEmbedUrl> => {
  const created = await (
    ReportsModel as {
      createReportMetadata: (
        record: CreateReportMetadataInput
      ) => Promise<ReportMetadataWithEmbedUrl | null>;
    }
  ).createReportMetadata(record);
  if (!created) throw new ValidationError('Failed to create report metadata');
  return created;
};

const updateReportMetadata = async (
  reportId: number,
  record: UpdateReportMetadataInput
): Promise<ReportMetadataWithEmbedUrl> => {
  // Check if report exists
  const existing = await ReportsModel.getReportsMetadata();
  const reportExists = existing?.some((r) => r.report_id === reportId);
  if (!reportExists) {
    throw new NotFoundError(`Report with ID ${reportId} not found`);
  }

  const updated = await (
    ReportsModel as {
      updateReportMetadata: (
        reportId: number,
        record: UpdateReportMetadataInput
      ) => Promise<ReportMetadataWithEmbedUrl | null>;
    }
  ).updateReportMetadata(reportId, record);
  if (!updated) throw new ValidationError('Failed to update report metadata');
  return updated;
};

const deleteReportMetadata = async (reportId: number): Promise<void> => {
  // Check if report exists
  const existing = await ReportsModel.getReportsMetadata();
  const reportExists = existing?.some((r) => r.report_id === reportId);
  if (!reportExists) {
    throw new NotFoundError(`Report with ID ${reportId} not found`);
  }

  await ReportsModel.deleteReportMetadata(reportId);
};

export {
  getReportsMetadata,
  getReportsByRole,
  createReportMetadata,
  updateReportMetadata,
  deleteReportMetadata,
};
