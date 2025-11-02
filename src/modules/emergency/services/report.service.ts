import cloudinary from '@/config/cloudinary.ts';
import { ReportModel } from '@/modules/emergency/models';
import type { CreateReport, ReportResponse } from '@/modules/emergency/types';

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
