import * as z from 'zod';

export const CreateMarkerTypeSchema = z.object({
  marker_type_icon: z.string().max(255).optional().nullable(),
  marker_type_color: z
    .string()
    .max(255)
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .optional()
    .nullable(),
});

export const UpdateMarkerTypeSchema = z.object({
  marker_type_icon: z.string().max(255).optional().nullable(),
  marker_type_color: z
    .string()
    .max(255)
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .optional()
    .nullable(),
});

export const MarkerTypeResponseSchema = z.object({
  id: z.number().int(),
  marker_type_icon: z.string().nullable(),
  marker_type_color: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
