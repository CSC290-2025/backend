import { ReportsModel } from '../models';
import type {
  ReportMetadataWithEmbedUrl,
  CreateReportMetadataInput,
  ReportsByCategory,
  UserRole,
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
  const normalizedRole = role.toLowerCase() as UserRole;
  if (!VALID_ROLES.includes(normalizedRole)) {
    throw new ValidationError(
      `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
    );
  }

  // Get all reports with category information
  const reports = await ReportsModel.getReportsMetadataWithCategory();
  if (!reports || reports.length === 0) {
    return {};
  }

  // Filter reports based on role (for now, all roles see all reports)
  // This can be extended later to filter based on role-specific permissions
  const filteredReports = reports;

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

export { getReportsMetadata, getReportsByRole, createReportMetadata };
