import { z } from 'zod';

//export const VolunteerEventStatus = z.enum(['draft', 'pending', 'approved', 'rejected']);

const EventSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  current_participants: z.number().int().default(0),
  total_seats: z.number().int().default(1),
  start_at: z.coerce.date().nullable(),
  end_at: z.coerce.date().nullable(),
  registration_deadline: z.coerce.date().nullable(),
  //status: VolunteerEventStatus.default('draft'),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  created_by_user_id: z.number().int().positive().nullable(),
  department_id: z.number().int().positive().nullable(),
  address_id: z.number().int().positive().nullable(),
});

const CreateEventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  start_at: z
    .string()
    .datetime({ message: 'Start date must be a valid ISO date string' }),
  end_at: z
    .string()
    .datetime({ message: 'End date must be a valid ISO date string' }),
  total_seats: z.number().int().optional(),
  created_by_user_id: z.number().int(),
  image_url: z.string().optional(),
  department_id: z.number().int().positive().optional(),
  registration_deadline: z
    .string()
    .datetime({ message: 'Deadline must be a valid ISO date string' })
    .optional(),
  address_id: z.number().int().positive().optional(),
  //status: VolunteerEventStatus.optional(),
});

const UpdateEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  start_at: z
    .string()
    .datetime({ message: 'Start date must be a valid ISO date string' })
    .optional(),
  end_at: z
    .string()
    .datetime({ message: 'End date must be a valid ISO date string' })
    .optional(),
  total_seats: z.number().int().optional(),
  image_url: z.string().optional().nullable(),
  department_id: z.number().int().positive().optional().nullable(),
  registration_deadline: z
    .string()
    .datetime({ message: 'Deadline must be a valid ISO date string' })
    .optional()
    .nullable(),
  address_id: z.number().int().positive().optional().nullable(),
  //status: VolunteerEventStatus.optional(),
});

const PaginationSchema = z.object({
  page: z.coerce.number().int().default(1),
  limit: z.coerce.number().int().default(9),
});

const EventIdParam = z.object({
  id: z.coerce.number().int(),
});

export {
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  PaginationSchema,
  EventIdParam,
};
