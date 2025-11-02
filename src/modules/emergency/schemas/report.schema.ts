import { z } from 'zod';

const CreateReportSchema = z.object({
  user_id: z.number().int().nullable().optional(),
  title: z.string(),
  image_url: z.string(),
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
  status: z.enum(['pending', 'resolved', 'verified']).nullable(),
  title: z.string().min(1).optional(),
  report_category: z
    .enum(['traffic', 'accident', 'disaster'])
    .optional()
    .nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export { CreateReportSchema, ReportResponseSchema };
