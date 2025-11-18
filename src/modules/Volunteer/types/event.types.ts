import type { z } from 'zod';
import type {
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  PaginationSchema,
} from '../schemas';

type VolunteerEvent = z.infer<typeof EventSchema>;
type CreateEventInput = z.infer<typeof CreateEventSchema>;
type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
type PaginationOptions = z.infer<typeof PaginationSchema>;

interface PaginatedEvents {
  events: VolunteerEvent[];
  total: number;
  page: number;
  totalPages: number;
}

export type {
  VolunteerEvent,
  CreateEventInput,
  UpdateEventInput,
  PaginationOptions,
  PaginatedEvents,
};
