import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '../../../utils/openapi-helpers';
import {
  EventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  PaginationSchema,
  EventIdParam,
} from '../schemas'; // Use relative path to schemas
import type { PaginatedEvents } from '../types';
import type { OpenAPIHono } from '@hono/zod-openapi';
import { ROLES } from '@/constants/roles';
import { adminMiddleware, requireRole } from '@/middlewares';
import * as EventController from '../controllers';

const PaginatedEventsSchemaForOpenAPI = z
  .object({
    events: z.array(EventSchema),
    total: z.number().int(),
    page: z.number().int(),
    totalPages: z.number().int(),
  })
  .openapi('PaginatedEventsResponse');

// --- 1. OpenAPI Route Definitions ---

export const listEventsRoute = createGetRoute({
  path: '/getAll',
  summary: 'List all volunteer events with pagination',
  responseSchema: PaginatedEventsSchemaForOpenAPI,
  query: PaginationSchema,
  tags: ['Volunteer'],
});

export const createEventRoute = createPostRoute({
  path: '/create',
  summary: 'Create a new volunteer event',
  requestSchema: EventSchema.partial(),
  responseSchema: z.array(EventSchema),
  tags: ['Volunteer'],
  middleware: [
    adminMiddleware,
    requireRole(ROLES.ADMIN, ROLES.VOLUNTEER_COORDINATOR),
  ],
});

export const getEventRoute = createGetRoute({
  path: '/{id}',
  summary: 'Get a single volunteer event by ID',
  responseSchema: EventSchema,
  params: EventIdParam,
  tags: ['Volunteer'],
});

export const updateEventRoute = createPutRoute({
  path: '/{id}/update',
  summary: 'Update an existing volunteer event',
  requestSchema: EventSchema.partial(),
  responseSchema: z.array(EventSchema),
  params: EventIdParam,
  tags: ['Volunteer'],
  middleware: [
    adminMiddleware,
    requireRole(ROLES.ADMIN, ROLES.VOLUNTEER_COORDINATOR),
  ],
});

export const deleteEventRoute = createDeleteRoute({
  path: '/{id}',
  summary: 'Delete a volunteer event',
  params: EventIdParam,
  tags: ['Volunteer'],
  middleware: [
    adminMiddleware,
    requireRole(ROLES.ADMIN, ROLES.VOLUNTEER_COORDINATOR),
  ],
});

export const setupVolunteerRoutes = (app: OpenAPIHono) => {
  app.openapi(listEventsRoute, EventController.getAllEvents);
  app.openapi(createEventRoute, EventController.createEvent);
  app.openapi(getEventRoute, EventController.getEventById);
  app.openapi(updateEventRoute, EventController.updateEvent);
  app.openapi(deleteEventRoute, EventController.deleteEvent);
};
