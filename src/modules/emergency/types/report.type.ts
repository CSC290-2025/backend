import type * as z from 'zod';
import type { ReportSchemas } from '@/modules/emergency/schemas/report.schema.ts';

type CreateReport = z.infer<typeof ReportSchemas.CreateReportSchema>;
type ReportResponse = z.infer<typeof ReportSchemas.ReportResponseSchema>;

export type { CreateReport, ReportResponse };
