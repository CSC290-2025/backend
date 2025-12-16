import type { OpenAPIHono } from '@hono/zod-openapi';
import { EventSchemas } from '../schemas';
import { EventController } from '../controllers';

const setupEventRoutes = (app: OpenAPIHono) => {
  // Event Routes

  // List all events (public)
  app.openapi(EventSchemas.listEventsRoute, EventController.listEvents);

  // Get daily event count (analytics or calendar view)
  app.openapi(EventSchemas.getEventByDayRoute, EventController.getEventByDay);

  // Create a new event (admin only)
  app.openapi(EventSchemas.createEventRoute, EventController.createEvent);

  // Update existing event (admin only)
  app.openapi(EventSchemas.updateEventRoute, EventController.updateEvent);

  // Delete event (admin only)
  app.openapi(EventSchemas.deleteEventRoute, EventController.deleteEvent);

  // Get a single event by ID (public)
  app.openapi(EventSchemas.getEventRoute, EventController.getEvent);
};

export { setupEventRoutes };
