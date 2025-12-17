import { isReportStatus } from '@/modules/emergency/schemas/branded.schema.ts';
import { z } from 'zod';

export const ReportStatusEnum = z
  .enum(['pending', 'resolved', 'verified'])
  .refine(isReportStatus);

const CreateReportSchema = z.object({
  user_id: z.number().int().nullable().optional(),
  title: z.string(),
  image_url: z.string().optional().nullable(),
  description: z.string().min(5).max(1000),
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().gte(-180).lte(180),
    })
    .optional(),
  ambulance_service: z.boolean().default(false),
  report_category: z
    .enum(['traffic', 'accident', 'disaster'])
    .optional()
    .nullable(),
});

const ReportResponseSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int().nullable().optional(),
  image_url: z.string().nullable(),
  description: z.string().min(5).max(1000).nullable(),
  location: z.any().nullable().optional(),
  ambulance_service: z.boolean().nullable(),
  contact_center_service: z.boolean().nullable().optional(),
  level: z
    .enum(['near_miss', 'minor', 'moderate', 'major', 'lethal'])
    .nullable(),
  status: ReportStatusEnum,
  title: z.string().min(1).optional(),
  report_category: z
    .enum(['traffic', 'accident', 'disaster'])
    .optional()
    .nullable(),
});

const PaginatedReportSchema = z.object({
  report: z.array(ReportResponseSchema),
  totalCount: z.number(),
});

const FindReportResponseSchema = z.object({
  report: z.array(ReportResponseSchema),
});

const UpdateReportByIdSchema = ReportResponseSchema.omit({
  id: true,
}).partial();

const ReportDeleteResponseSchema = z.object({
  id: z.number().int(),
});

export {
  CreateReportSchema,
  ReportResponseSchema,
  PaginatedReportSchema,
  FindReportResponseSchema,
  UpdateReportByIdSchema,
  ReportDeleteResponseSchema,
};
