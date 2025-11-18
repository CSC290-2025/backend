import type * as z from 'zod';
import type { ReportSchemas } from '@/modules/emergency/schemas';

type CreateReport = z.infer<typeof ReportSchemas.CreateReportSchema>;
type ReportResponse = z.infer<typeof ReportSchemas.ReportResponseSchema>;
type PaginatedReport = z.infer<typeof ReportSchemas.PaginatedReportSchema>;

export type { CreateReport, ReportResponse, PaginatedReport };
