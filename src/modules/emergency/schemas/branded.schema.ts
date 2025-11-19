import type { report_status } from '@/generated/prisma';

interface Branding<BrandT> {
  _type: BrandT;
}
type Brand<T, BrandT extends string> = T & Branding<BrandT>;

export type ReportId = Brand<number, 'ReportId'>;
export const isReportId = (id: number): id is ReportId => true;

export type ReportStatus = Brand<report_status, 'ReportStatus'>;
export const isReportStatus = (
  status: report_status
): status is ReportStatus => {
  return status === 'pending' || status === 'resolved' || status === 'verified';
};
