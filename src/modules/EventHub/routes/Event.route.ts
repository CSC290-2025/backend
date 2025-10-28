import type { OpenAPIHono } from '@hono/zod-openapi';
import { EventSchemas } from '../schemas';
import { EventController } from '../controllers';

export const setupEventRoutes = (app: OpenAPIHono) => {
  // Event Routes

  // List all events (public)
  app.openapi(EventSchemas.listEventsRoute, EventController.listEvents);

  // Get a single event by ID (public)
  app.openapi(EventSchemas.getEventRoute, EventController.getEvent);

  // Create a new event (auth required)
  app.openapi(EventSchemas.createEventRoute, EventController.createEvent);

  // Update existing event (auth)
  app.openapi(EventSchemas.updateEventRoute, EventController.updateEvent);

  // Delete event (auth)
  app.openapi(EventSchemas.deleteEventRoute, EventController.deleteEvent);

  // Get daily event count (analytics or calendar view)
  app.openapi(
    EventSchemas.dayEventCountRoute,
    EventController.getDayEventCount
  );
};

export { setupEventRoutes };
