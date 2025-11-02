import prisma from '@/config/client.ts';
import { handlePrismaError } from '@/errors';
import type { CreateReport, ReportResponse } from '@/modules/emergency/types';

const createReport = async (data: CreateReport): Promise<ReportResponse> => {
  try {
    return await prisma.emergency_reports.create({
      data,
    });
  } catch (error) {
    console.error(error);
    handlePrismaError(error);
  }
};

export { createReport };
