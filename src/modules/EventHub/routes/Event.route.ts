import type { OpenAPIHono } from '@hono/zod-openapi';
import { EventSchemas } from '../schemas';
import { EventController } from '../controllers';
import { adminMiddleware } from '@/middlewares/admin'; // Importing adminMiddleware

const setupEventRoutes = (app: OpenAPIHono) => {
  // Event Routes

  // Get all waste events
  app.openapi(
    EventSchemas.listWasteEventsRoute,
    EventController.listWasteEvents
  );
  // List all events (public)
  app.openapi(EventSchemas.listEventsRoute, EventController.listEvents);

  // Get daily event count (analytics or calendar view)
  app.openapi(EventSchemas.getEventByDayRoute, EventController.getEventByDay);

  // Create a new event (admin only - auth required)
  app.openapi(EventSchemas.createEventRoute, EventController.createEvent);

  // Update existing event (admin only - auth required)
  app.openapi(EventSchemas.updateEventRoute, EventController.updateEvent);

  // Delete event (admin only - auth required)
  app.openapi(EventSchemas.deleteEventRoute, EventController.deleteEvent);
  // List past bookmarked events (auth required)
  app.openapi(
    EventSchemas.listPastBookmarkedEventsRoute,
    EventController.listPastBookmarkedEvents
  );
  // Get a single event by ID (public)
  app.openapi(EventSchemas.getEventRoute, EventController.getEvent);
};
export { setupEventRoutes };
