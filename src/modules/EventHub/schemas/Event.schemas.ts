import { z, createRoute } from '@hono/zod-openapi';

const EventSchema = z
  .object({
    id: z.number().int(),
    host_user_id: z.number().int().nullable(),
    organization_id: z.number().int().nullable(),
    image_url: z.string().nullable(),
    title: z.string(),
    description: z.string().nullable(),
    total_seats: z.number().int().default(0),
    start_at: z.coerce.date(),
    end_at: z.coerce.date(),
    address_id: z.number().int().nullable(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
  })
  .openapi('Event');

const CreateEventSchema = z
  .object({
    host_user_id: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string().optional(),
    image_url: z.string().optional(),
    total_seats: z.number().int().min(0).optional(),
    start_at: z.string().datetime({ message: 'Must be ISO date-time' }),
    end_at: z.string().datetime({ message: 'Must be ISO date-time' }),
    address_id: z.number().int().positive().optional(),
    organization_id: z.number().int().positive().optional(),
  })
  .openapi('CreateEvent');

const UpdateEventSchema = z
  .object({
    host_user_id: z.number().int().positive().optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    image_url: z.string().optional().nullable(),
    total_seats: z.number().int().min(0).optional(),
    start_at: z.string().datetime().optional(),
    end_at: z.string().datetime().optional(),
    address_id: z.number().int().positive().optional().nullable(),
    organization_id: z.number().int().positive().optional().nullable(),
  })
  .openapi('UpdateEvent');

const IdParam = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .openapi('IdParam');

const EventListQuery = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    q: z.string().max(255).optional(),
    organization_id: z.coerce.number().int().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .openapi('EventListQuery');

const ListEventsResponse = z.object({
  items: z.array(EventSchema),
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
});

const DayEventCountItem = z.object({
  date: z.string().openapi({ example: '2025-11-02' }),
  count: z.number().int().nonnegative(),
});

const EventSchemas = {
  listEventsRoute: createRoute({
    method: 'get',
    path: '/events',
    request: { query: EventListQuery },
    responses: {
      200: {
        description: 'List events',
        content: { 'application/json': { schema: ListEventsResponse } },
      },
    },
    tags: ['Events'],
  }),

  getEventRoute: createRoute({
    method: 'get',
    path: '/events/{id}',
    request: { params: IdParam },
    responses: {
      200: {
        description: 'Get a single event',
        content: {
          'application/json': { schema: z.object({ event: EventSchema }) },
        },
      },
    },
    tags: ['Events'],
  }),

  createEventRoute: createRoute({
    method: 'post',
    path: '/events',
    request: {
      body: { content: { 'application/json': { schema: CreateEventSchema } } },
    },
    responses: {
      201: {
        description: 'Created',
        content: {
          'application/json': { schema: z.object({ event: EventSchema }) },
        },
      },
    },
    tags: ['Events'],
  }),

  updateEventRoute: createRoute({
    method: 'put',
    path: '/events/{id}',
    request: {
      params: IdParam,
      body: { content: { 'application/json': { schema: UpdateEventSchema } } },
    },
    responses: {
      200: {
        description: 'Updated',
        content: {
          'application/json': { schema: z.object({ event: EventSchema }) },
        },
      },
    },
    tags: ['Events'],
  }),

  deleteEventRoute: createRoute({
    method: 'delete',
    path: '/events/{id}',
    request: { params: IdParam },
    responses: {
      200: {
        description: 'Deleted',
        content: {
          'application/json': {
            schema: z.object({ success: z.literal(true) }),
          },
        },
      },
    },
    tags: ['Events'],
  }),

  dayEventCountRoute: createRoute({
    method: 'get',
    path: '/events/day-count',
    request: {
      query: z.object({
        from: z.string().date(),
        to: z.string().date(),
      }),
    },
    responses: {
      200: {
        description: 'Daily event counts',
        content: {
          'application/json': {
            schema: z.object({ data: z.array(DayEventCountItem) }),
          },
        },
      },
    },
    tags: ['Events'],
  }),
};

export {
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  EventSchemas,
  EventListQuery,
  ListEventsResponse,
  DayEventCountItem,
  IdParam,
};
