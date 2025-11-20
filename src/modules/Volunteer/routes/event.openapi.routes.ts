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
import { OpenAPIHono } from '@hono/zod-openapi';
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
  requestSchema: CreateEventSchema,
  responseSchema: EventSchema,
  tags: ['Volunteer'],
});

export const getEventRoute = createGetRoute({
  path: '/{id}',
  summary: 'Get a single volunteer event by ID',
  responseSchema: EventSchema,
  params: EventIdParam,
  tags: ['Volunteer'],
});

export const updateEventRoute = createPutRoute({
  path: '/{id}',
  summary: 'Update an existing volunteer event',
  requestSchema: UpdateEventSchema,
  responseSchema: EventSchema,
  params: EventIdParam,
  tags: ['Volunteer'],
});

export const deleteEventRoute = createDeleteRoute({
  path: '/{id}',
  summary: 'Delete a volunteer event',
  params: EventIdParam,
  tags: ['Volunteer'],
});

// --- 2. Setup Function ---

export const setupEventRoutes = () => {
  // Create a new OpenAPIHono instance for this module
  const volunteerApp = new OpenAPIHono();

  // Register routes (Order matters! Specific paths first)
  console.log(`--- Registering OpenAPI route: GET / ---`);
  volunteerApp.openapi(listEventsRoute, EventController.getAllEvents);

  console.log(`--- Registering OpenAPI route: POST /create ---`);
  volunteerApp.openapi(createEventRoute, EventController.createEvent);

  console.log(`--- Registering OpenAPI route: GET /{id} ---`);
  volunteerApp.openapi(getEventRoute, EventController.getEventById);

  volunteerApp.openapi(updateEventRoute, EventController.updateEvent);

  volunteerApp.openapi(deleteEventRoute, EventController.deleteEvent);

  return volunteerApp;
};
