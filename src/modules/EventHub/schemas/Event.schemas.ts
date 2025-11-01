import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const OrgSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().nullable().optional(),
  phone_number: z.string().nullable().optional(),
});

const AddressSchema = z.object({
  id: z.number(),
  street: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  province: z.string(),
  postal_code: z.string(),
});

const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  image_url: z.string().url().nullable(),
  total_seats: z.number().int().min(0),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  host_user_id: z.number(),
  address_id: z.number(),
  organization_id: z.number(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const EventWithRelationsSchema = EventSchema.extend({
  event_organization: OrgSchema.optional(),
  addresses: AddressSchema.optional(),
  event_tags: z.array(z.object({ event_tag_name: TagSchema })).default([]),
});

const CreateEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string(),
  image_url: z.string().url().nullable().optional(),
  total_seats: z.number().int().min(0).default(0),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  address_id: z.number(),
  organization_id: z.number(),
  tag_ids: z.array(z.number()).optional(),
});

const UpdateEventSchema = CreateEventSchema.partial();

const EventIdParam = z.object({
  id: z.string().transform(Number).pipe(z.number().int()),
});

const PaginationQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default('10'),
});

const ListEventsFilterSchema = z.object({
  search: z.string().optional(),
  organization_id: z
    .string()
    .transform(Number)
    .pipe(z.number().int())
    .optional(),
  tag: z.string().optional(),
  start_date: z.string().datetime().optional(),
});

const DayEventCountQuerySchema = z.object({
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
});

const listEventsRoute = createGetRoute({
  path: '/events',
  summary: 'Get all events',
  responseSchema: z.object({
    events: z.array(EventWithRelationsSchema),
    pagination: z.object({
      current_page: z.number(),
      total_pages: z.number(),
      total_items: z.number(),
      items_per_page: z.number(),
    }),
  }),
  query: PaginationQuerySchema.merge(ListEventsFilterSchema),
  tags: ['Events'],
});

const getEventRoute = createGetRoute({
  path: '/events/{id}',
  summary: 'Get event by ID',
  responseSchema: EventWithRelationsSchema,
  params: EventIdParam,
  tags: ['Events'],
});

const createEventRoute = createPostRoute({
  path: '/events',
  summary: 'Create new event (Admin only)',
  requestSchema: CreateEventSchema,
  responseSchema: EventSchema,
  tags: ['Events'],
});

const updateEventRoute = createPutRoute({
  path: '/events/{id}',
  summary: 'Update event (Admin only)',
  requestSchema: UpdateEventSchema,
  responseSchema: EventSchema,
  params: EventIdParam,
  tags: ['Events'],
});

const deleteEventRoute = createDeleteRoute({
  path: '/events/{id}',
  summary: 'Delete event (Admin only)',
  params: EventIdParam,
  tags: ['Events'],
});

const dayEventCountRoute = createGetRoute({
  path: '/events/day-count',
  summary: 'Get daily event count',
  responseSchema: z.array(z.object({ date: z.string(), count: z.number() })),
  query: DayEventCountQuerySchema,
  tags: ['Events'],
});

export {
  OrgSchema,
  AddressSchema,
  TagSchema,
  EventSchema,
  EventWithRelationsSchema,
  CreateEventSchema,
  UpdateEventSchema,
  EventIdParam,
  PaginationQuerySchema,
  ListEventsFilterSchema,
  DayEventCountQuerySchema,
  listEventsRoute,
  getEventRoute,
  createEventRoute,
  updateEventRoute,
  deleteEventRoute,
  dayEventCountRoute,
};
