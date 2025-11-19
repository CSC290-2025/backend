import { ReportModel } from '@/modules/emergency/models';
import type {
  CreateReport,
  PaginatedReport,
  ReportResponse,
} from '@/modules/emergency/types';
import type { ReportStatus } from '@/modules/emergency/schemas/branded.schema.ts';
import { ValidationError } from '@/errors';
import { uploadFile } from '@/utils/upload.ts';
import { base64ToBlobFromDataUrl } from '@/modules/emergency/utils';

export const createReport = async (
  data: CreateReport
): Promise<ReportResponse> => {
  const imageData = data.image_url;
  if (imageData) {
    const imageBlob = base64ToBlobFromDataUrl(imageData);
    const uploadedResponse = await uploadFile({ fileBlob: imageBlob }, 13);
    data.image_url = uploadedResponse.url;
  }
  return await ReportModel.createReport(data);
};

export const findReportByStatus = async (
  status: ReportStatus,
  page: number,
  limit: number
): Promise<PaginatedReport> => {
  const { report, totalPage } = await ReportModel.findReportByStatus(
    status,
    page,
    limit
  );

  if (page > limit) {
    throw new ValidationError('Page greater than limit');
  }
  return {
    report: report,
    totalPage,
  };
};
