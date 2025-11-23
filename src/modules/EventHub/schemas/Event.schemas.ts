import { z, createRoute } from '@hono/zod-openapi';
//import { authMiddleware, adminMiddleware } from '@/middlewares';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '../../../utils/openapi-helpers';

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

const OrganizationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone_number: z.string().min(1),
});

const AddressSchema = z.object({
  address_line: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  subdistrict: z.string().optional(),
  postal_code: z.string().optional(),
});

const CreateEventSchema = z
  .object({
    host_user_id: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string().optional(),
    total_seats: z.number().int().min(0).optional(),
    start_date: z.string().date(),
    start_time: z.string().time(),
    end_date: z.string().date(),
    end_time: z.string().time(),
    // Can provide either organization object or organization_id
    organization: OrganizationSchema.optional(),
    organization_id: z.number().int().positive().optional(),
    // Can provide either address object or address_id
    address: AddressSchema.optional(),
    address_id: z.number().int().positive().optional(),
    // Event tag name
    event_tag_name: z.string().optional(),
  })
  .openapi('CreateEvent');

const UpdateEventSchema = z
  .object({
    host_user_id: z.number().int().positive().optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    total_seats: z.number().int().min(0).optional(),
    start_date: z.string().date().optional(),
    start_time: z.string().time().optional(),
    end_date: z.string().date().optional(),
    end_time: z.string().time().optional(),
    organization: OrganizationSchema.optional(),
    organization_id: z.number().int().positive().optional(),
    address: AddressSchema.optional(),
    address_id: z.number().int().positive().optional(),
    event_tag_name: z.string().optional(),
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

  // createEventRoute: createRoute({
  //   method: 'post',
  //   path: '/events',
  //   request: {
  //     body: { content: { 'application/json': { schema: CreateEventSchema } } },
  //   },
  //   responses: {
  //     201: {
  //       description: 'Created',
  //       content: {
  //         'application/json': { schema: z.object({ event: EventSchema }) },
  //       },
  //     },
  //   },
  //   tags: ['Events'],
  //   //middleware: [authMiddleware, adminMiddleware],
  // }),

  createEventRoute: createPostRoute({
    path: '/events',
    summary: 'post event',
    requestSchema: CreateEventSchema.partial(),
    responseSchema: z.array(CreateEventSchema),
    tags: ['Events'],
    // middleware: [authMiddleware, adminMiddleware],
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
    //middleware: [authMiddleware, adminMiddleware],
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
    // middleware: [authMiddleware, adminMiddleware],
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
