import { ContactModel, ReportModel } from '@/modules/emergency/models';
import type {
  ContactResponse,
  CreateContact,
  CreateReport,
  PaginatedReport,
  ReportDeleteResponse,
  ReportResponse,
  UpdateReport,
} from '@/modules/emergency/types';
import type { ReportStatus } from '@/modules/emergency/schemas/branded.schema.ts';
import { NotFoundError, ValidationError } from '@/errors';
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
  console.log(data);
  return await ReportModel.createReport(data);
};

export const findReportByStatus = async (
  status: ReportStatus,
  page: number,
  limit: number
): Promise<PaginatedReport> => {
  const { report, totalCount } = await ReportModel.findReportByStatus(
    status,
    page,
    limit
  );

  if (page > limit) {
    throw new ValidationError('Page greater than limit');
  }
  return {
    report: report,
    totalCount,
  };
};

export const updateReportById = async (
  id: number,
  data: UpdateReport
): Promise<Partial<ReportResponse>> => {
  if (!id) throw new ValidationError('Id is required');
  if (!data) throw new ValidationError('Data is required');

  return await ReportModel.updateReportById(id, data);
};

export const deleteReportById = async (
  id: number
): Promise<ReportDeleteResponse> => {
  if (!id) throw new ValidationError('Id is required');

  return await ReportModel.deleteReportById(id);
};

export const findReportById = async (id: number): Promise<ReportResponse> => {
  const report = await ReportModel.getReportById(id);

  if (!report) {
    throw new NotFoundError('Not Found this user id');
  }
  return report;
};
