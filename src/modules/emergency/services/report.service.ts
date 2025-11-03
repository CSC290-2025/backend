import cloudinary from '@/config/cloudinary.ts';
import { ReportModel } from '@/modules/emergency/models';
import type { CreateReport, ReportResponse } from '@/modules/emergency/types';
import type { ReportStatus } from '@/modules/emergency/schemas/branded.schema.ts';
import { ValidationError } from '@/errors';

export const createReport = async (
  data: CreateReport
): Promise<ReportResponse> => {
  const imageUrl = data.image_url;
  if (imageUrl) {
    const uploadedResponse = await cloudinary.uploader.upload(imageUrl, {
      upload_preset: 'report',
    });
    data.image_url = uploadedResponse.secure_url;
  }
  return await ReportModel.createReport(data);
};

export const findReportByStatus = async (
  status: ReportStatus,
  page: number,
  limit: number
): Promise<ReportResponse[]> => {
  const report = await ReportModel.findReportByStatus(status, page, limit);
  if (page > limit) throw new ValidationError('Page not found');

  return report;
};
