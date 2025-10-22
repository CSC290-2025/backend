import { ReportModel } from '@/modules/emergency/models';
import type { CreateReport, ReportResponse } from '@/modules/emergency/types';

export const createReport = async (
  data: CreateReport
): Promise<ReportResponse> => {
  return await ReportModel.createReport(data);
};
