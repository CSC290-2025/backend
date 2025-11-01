import type { z } from 'zod';
import type {
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
} from '../schemas';

type Event = z.infer<typeof EventSchema>;
type CreateEventInput = z.infer<typeof CreateEventSchema>;
type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

export type { Event, CreateEventInput, UpdateEventInput };
