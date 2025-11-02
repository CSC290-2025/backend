import type { OpenAPIHono } from '@hono/zod-openapi';
import { EventSchemas } from '../schemas';
import { EventController } from '../controllers';
import { AuthMiddleware } from '@/middlewares/auth_example';

const setupEventRoutes = (app: OpenAPIHono) => {
  // Event Routes

  // List all events (public)
  app.openapi(EventSchemas.listEventsRoute, EventController.listEvents);

  // Get a single event by ID (public)
  app.openapi(EventSchemas.getEventRoute, EventController.getEvent);

  // Create a new event (admin only)
  app.openapi(EventSchemas.createEventRoute, async (c) => {
    await AuthMiddleware.isAdmin(c, async () => {});
    return EventController.createEvent(c);
  });

  // Update existing event (admin only)
  app.openapi(EventSchemas.updateEventRoute, async (c) => {
    await AuthMiddleware.isAdmin(c, async () => {});
    return EventController.updateEvent(c);
  });

  // Delete event (admin only)
  app.openapi(EventSchemas.deleteEventRoute, async (c) => {
    await AuthMiddleware.isAdmin(c, async () => {});
    return EventController.deleteEvent(c);
  });

  // Get daily event count (analytics or calendar view)
  app.openapi(
    EventSchemas.dayEventCountRoute,
    EventController.getDayEventCount
  );
};

export { setupEventRoutes };
