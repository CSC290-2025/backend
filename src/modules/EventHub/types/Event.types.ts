import type { z } from 'zod';
import type { EventSchemas } from '../schemas';

type Event = z.infer<typeof EventSchemas.EventSchema>;
type CreateEventInput = z.infer<typeof EventSchemas.CreateEventSchema>;
type UpdateEventInput = z.infer<typeof EventSchemas.UpdateEventSchema>;

export type { Event, CreateEventInput, UpdateEventInput };
