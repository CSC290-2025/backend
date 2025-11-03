import prisma from '@/config/client.ts';
import { handlePrismaError, ValidationError } from '@/errors';
import type { CreateReport, ReportResponse } from '@/modules/emergency/types';
import type { ReportStatus } from '@/modules/emergency/schemas/branded.schema.ts';

const createReport = async (data: CreateReport): Promise<ReportResponse> => {
  try {
    const report = await prisma.emergency_reports.create({ data });

    return {
      id: report.id,
      image_url: report.image_url,
      description: report.description,
      ambulance_service: report.ambulance_service,
      level: report.level,
      status: (report.status ?? 'pending') as
        | 'pending'
        | 'resolved'
        | 'verified',
      report_category: report.report_category ?? undefined,
      created_at: report.created_at,
      updated_at: report.updated_at,
      title: report.title,
      user_id: report.user_id,
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

const findReportByStatus = async (
  status: ReportStatus,
  page: number,
  perPage: number
): Promise<ReportResponse[]> => {
  try {
    if (status === null || !status) {
      throw new ValidationError('Status is required');
    }
    const report = await prisma.emergency_reports.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where: {
        status: status,
      },
    });

    return report.map((r) => ({
      id: r.id,
      image_url: r.image_url,
      description: r.description,
      ambulance_service: r.ambulance_service,
      level: r.level,
      status: (r.status ?? 'pending') as ReportStatus,
      report_category: r.report_category ?? undefined,
      created_at: r.created_at,
      updated_at: r.updated_at,
      title: r.title,
      user_id: r.user_id,
    }));
  } catch (error) {
    console.log(error);
    handlePrismaError(error);
  }
};

export { createReport, findReportByStatus };
