import { z } from 'zod';

// Base
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
  tag: z.string().optional(),
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
  tag: z.string().nullable().optional(),
  //status: VolunteerEventStatus.optional(),
});

const PaginationSchema = z.object({
  page: z.coerce.number().int().default(1),
  limit: z.coerce.number().int().default(9),
  search: z.string().optional(),
  department_id: z.coerce.number().int().positive().optional(),
  tag: z.string().optional(),
});

const EventIdParam = z.object({
  id: z.coerce.number().int(),
});

// --- NEW SCHEMAS BELOW ---

// In your schemas file (e.g., src/modules/Volunteer/schemas/volunteer.ts)

const GetEventByIdQuerySchema = z.object({
  userId: z.coerce
    .number()
    .int()
    .positive()
    // 1. Make the field optional for when it is missing from the query object
    .optional()
    // 2. Set the default value to undefined. This ensures that if the input is
    //    an empty string ('') (often coerced to 0 or NaN) or truly missing,
    //    the output is always clean 'undefined' for the service layer.
    .default(undefined),
});
const EventDetailResponseSchema = z.object({
  event: EventSchema,
  is_joined: z.boolean().default(false),
});

export {
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  PaginationSchema,
  EventIdParam,
  // Export new schemas
  GetEventByIdQuerySchema,
  EventDetailResponseSchema,
};
