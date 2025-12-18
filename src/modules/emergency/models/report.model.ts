import prisma from '@/config/client.ts';
import { handlePrismaError, ValidationError } from '@/errors';
import type {
  CreateReport,
  PaginatedReport,
  ReportDeleteResponse,
  ReportResponse,
  UpdateReport,
} from '@/modules/emergency/types';
import type { ReportStatus } from '@/modules/emergency/schemas/branded.schema.ts';

const createReport = async (data: CreateReport): Promise<ReportResponse> => {
  try {
    const report = await prisma.emergency_reports.create({ data });
    return {
      ...report,
      status: (report.status ?? 'pending') as ReportStatus,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const findReportByStatus = async (
  status: ReportStatus,
  page: number,
  perPage: number
): Promise<PaginatedReport> => {
  try {
    if (status === null || !status) {
      throw new ValidationError('Status is required');
    }

    if (!page || !perPage || isNaN(page) || isNaN(perPage)) {
      throw new ValidationError('Page and perPage must be valid numbers');
    }

    const report = await prisma.emergency_reports.findMany({
      skip: (page - 1) * perPage,
      where: {
        status: status,
      },
      take: perPage,
      orderBy: { created_at: 'desc' },
    });

    const totalCount = await prisma.emergency_reports.count({
      where: { status },
    });

    return {
      report: report.map((r) => ({
        ...r,
        status: (r.status ?? 'pending') as ReportStatus,
        report_category: r.report_category ?? undefined,
      })),
      totalCount: totalCount,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const updateReportById = async (
  id: number,
  data: UpdateReport
): Promise<Partial<ReportResponse>> => {
  try {
    const report = await prisma.emergency_reports.update({
      where: { id },
      data: data,
    });
    return {
      ...report,
      status: (report.status ?? 'pending') as ReportStatus,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const deleteReportById = async (id: number): Promise<ReportDeleteResponse> => {
  try {
    const report = await prisma.emergency_reports.delete({
      where: { id },
    });
    return { id: report.id };
  } catch (error) {
    handlePrismaError(error);
  }
};

const getReportById = async (id: number): Promise<ReportResponse | null> => {
  try {
    const report = await prisma.emergency_reports.findFirst({
      where: { id: id },
    });

    if (!report) return null;

    return report;
  } catch (error) {
    handlePrismaError(error);
    return null;
  }
};

export {
  createReport,
  findReportByStatus,
  updateReportById,
  deleteReportById,
  getReportById,
};
