import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
const OrganizationSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone_number: z.string(),
});

const AddressSchema = z.object({
  address_line: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  subdistrict: z.string().optional(),
  postal_code: z.string().optional(),
});
const EventSchema = z.object({
  id: z.number().int(),
  host_user_id: z.number().int().nullable(),
  organization_id: z.number().int().nullable(),
  address_id: z.number().int().nullable(),

  image_url: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  total_seats: z.number().int().default(0),

  start_at: z.coerce.date(),
  end_at: z.coerce.date(),

  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),

  organization: OrganizationSchema.nullable().optional(),
  address: AddressSchema.nullable().optional(),
});

const CreateEventSchema = z.object({
  host_user_id: z.number().int().positive(),

  title: z.string().min(1),
  description: z.string().optional(),
  total_seats: z.number().int().min(0).optional(),
  image_url: z.string().optional(),

  start_date: z.iso.date(),
  start_time: z.iso.time(),

  end_date: z.iso.date(),
  end_time: z.iso.time(),

  organization: OrganizationSchema,
  organization_id: z.number().int().positive().optional(),

  address: AddressSchema,
  address_id: z.number().int().positive().optional(),

  event_tag_name: z.string().optional(),
});

const UpdateEventSchema = z.object({
  host_user_id: z.number().int().positive().optional(),

  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  total_seats: z.number().int().min(0).optional(),
  image_url: z.string().optional(),
  start_date: z.iso.date().optional(),
  start_time: z.iso.time().optional(),

  end_date: z.iso.date().optional(),
  end_time: z.iso.time().optional(),

  organization: OrganizationSchema.optional(),
  organization_id: z.number().int().positive().optional(),

  address: AddressSchema.optional(),
  address_id: z.number().int().positive().optional(),

  event_tag_name: z.string().optional(),
});

const IdParam = z.object({
  id: z.coerce.number().int().positive(),
});

const EventListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const ListEventsResponse = z.object({
  items: z.array(EventSchema),
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
});

const DayEventCountItem = z.object({
  date: z.string(),
  count: z.number().int().nonnegative(),
});

// Routes (Raw schema)
const listEventsRoute = createGetRoute({
  path: '/events',
  summary: 'List events',
  responseSchema: ListEventsResponse,
  query: EventListQuery,
  tags: ['Events'],
});

const getEventRoute = createGetRoute({
  path: '/events/{id}',
  summary: 'Get event',
  responseSchema: z.object({ event: EventSchema }),
  params: IdParam,
  tags: ['Events'],
});

const createEventRoute = createPostRoute({
  path: '/events',
  summary: 'Create event',
  requestSchema: CreateEventSchema,
  responseSchema: z.object({ event: EventSchema }),
  tags: ['Events'],
});

const updateEventRoute = createPutRoute({
  path: '/events/{id}',
  summary: 'Update event',
  requestSchema: UpdateEventSchema,
  responseSchema: z.object({ event: EventSchema }),
  params: IdParam,
  tags: ['Events'],
});

const deleteEventRoute = createDeleteRoute({
  path: '/events/{id}',
  summary: 'Delete event',
  params: IdParam,
  tags: ['Events'],
});
const getEventByDayRoute = createGetRoute({
  path: '/events/by-day',
  summary: 'Get events in a specific day',
  query: z.object({
    date: z.coerce.date(),
  }),
  responseSchema: z.object({
    data: z.array(EventSchema),
  }),
  tags: ['Events'],
});

export const EventSchemas = {
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  EventListQuery,
  ListEventsResponse,
  DayEventCountItem,
  IdParam,
  listEventsRoute,
  getEventRoute,
  createEventRoute,
  updateEventRoute,
  deleteEventRoute,
  getEventByDayRoute,
};
