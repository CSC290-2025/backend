# ROLE MIDDLEWARE USAGE EXAMPLES

This guide shows how to add role-based access control (RBAC) to OpenAPI routes using the middleware parameter.

## EXAMPLE 1: In OpenAPI Schema (schemas file)

```typescript
import { createPostRoute, createGetRoute, createDeleteRoute } from '@/utils/openapi-helpers';
import { requireRole, adminMiddleware } from '@/middlewares';
import { ROLES } from '@/constants/roles';
import { z } from 'zod';

// Admin only - delete user
export const deleteUserRoute = createDeleteRoute({
  path: '/users/{id}',
  summary: 'Delete a user',
  params: z.object({ id: z.string().uuid() }),
  tags: ['Users'],
  middleware: [adminMiddleware],
});

// Single role - Traffic Manager only
export const updateTrafficLightRoute = createPostRoute({
  path: '/traffic/lights/{id}',
  summary: 'Update traffic light status',
  requestSchema: z.object({ status: z.enum(['red', 'yellow', 'green']) }),
  responseSchema: z.object({ id: z.number(), status: z.string() }),
  params: z.object({ id: z.string() }),
  tags: ['Traffic'],
  middleware: [requireRole(ROLES.TRAFFIC_MANAGER)],
});

// Multiple roles - Admin OR Moderator
export const deleteContentRoute = createDeleteRoute({
  path: '/content/{id}',
  summary: 'Delete content',
  params: z.object({ id: z.string() }),
  tags: ['Content'],
  middleware: [requireRole([ROLES.ADMIN, ROLES.MODERATOR])],
});

// Event Organizer only - custom error message
export const createEventRoute = createPostRoute({
  path: '/events',
  summary: 'Create a new event',
  requestSchema: z.object({ name: z.string(), date: z.string() }),
  responseSchema: z.object({ id: z.number(), name: z.string() }),
  tags: ['Events'],
  middleware: [requireRole(ROLES.EVENT_ORGANIZER, 'Only Event Organizers can create events')],
});

// Financial Manager only
export const processPaymentRoute = createPostRoute({
  path: '/payments',
  summary: 'Process a payment',
  requestSchema: z.object({ amount: z.number(), userId: z.number() }),
  responseSchema: z.object({ paymentId: z.string(), status: z.string() }),
  tags: ['Payments'],
  middleware: [requireRole(ROLES.FINANCIAL_MANAGER)],
});

// Waste Manager only
export const getWasteDataRoute = createGetRoute({
  path: '/waste/data',
  summary: 'Get waste statistics',
  responseSchema: z.array(z.object({ date: z.string(), amount: z.number() })),
  tags: ['Waste'],
  middleware: [requireRole(ROLES.WASTE_MANAGER)],
});
```

// Volunteer Coordinator only
export const approveVolunteerRoute = createPostRoute({
  path: '/volunteers/{id}/approve',
  summary: 'Approve a volunteer',
  requestSchema: z.object({ approved: z.boolean() }),
  responseSchema: z.object({ id: z.number(), approved: z.boolean() }),
  params: z.object({ id: z.string() }),
  tags: ['Volunteers'],
  middleware: [requireRole(ROLES.VOLUNTEER_COORDINATOR)],
});

// ============================================
// EXAMPLE 2: In Routes Setup (routes file)
// ============================================

```typescript
import type { OpenAPIHono } from '@hono/zod-openapi';

const setupExampleRoutes = (app: OpenAPIHono) => {
  // Admin routes
  app.openapi(deleteUserRoute, UserController.deleteUser);

  // Traffic routes
  app.openapi(updateTrafficLightRoute, TrafficController.updateLight);

  // Content moderation
  app.openapi(deleteContentRoute, ContentController.delete);

  // Event management
  app.openapi(createEventRoute, EventController.create);

  // Financial operations
  app.openapi(processPaymentRoute, FinancialController.processPayment);

  // Waste management
  app.openapi(getWasteDataRoute, WasteController.getData);

  // Volunteer coordination
  app.openapi(approveVolunteerRoute, VolunteerController.approve);
};

export { setupExampleRoutes };
```

// ============================================
// EXAMPLE 3: Module-Specific Implementation
// ============================================

```typescript
// In modules/Emergency/schemas/emergency.schemas.ts
export const emergencySchemas = {
  sendAlertRoute: createPostRoute({
    path: '/alerts/send',
    summary: 'Send emergency alert',
    requestSchema: z.object({ message: z.string(), severity: z.enum(['low', 'high']) }),
    responseSchema: z.object({ alertId: z.number() }),
    tags: ['Emergency'],
    middleware: [requireRole(ROLES.EMERGENCY_MANAGER, 'Only Emergency Managers can send alerts')],
  }),

  getReportsRoute: createGetRoute({
    path: '/reports',
    summary: 'Get emergency reports',
    responseSchema: z.array(z.object({ id: z.number(), date: z.string() })),
    tags: ['Emergency'],
    middleware: [requireRole([ROLES.ADMIN, ROLES.EMERGENCY_MANAGER])],
  }),
};

// In modules/Apartment/schemas/apartment.schemas.ts
export const apartmentSchemas = {
  createListingRoute: createPostRoute({
    path: '/listings',
    summary: 'Create apartment listing',
    requestSchema: z.object({ address: z.string(), price: z.number() }),
    responseSchema: z.object({ id: z.number() }),
    tags: ['Apartments'],
    middleware: [requireRole(ROLES.APARTMENT_MANAGER)],
  }),

  deleteListingRoute: createDeleteRoute({
    path: '/listings/{id}',
    summary: 'Delete apartment listing',
    params: z.object({ id: z.string() }),
    tags: ['Apartments'],
    middleware: [requireRole(ROLES.APARTMENT_MANAGER)],
  }),
};
```

// ============================================
// AVAILABLE ROLES (for reference)
// ============================================

```
From src/constants/roles.ts:

ROLES.ADMIN = 'Admin' - Full system access
ROLES.MODERATOR = 'Moderator' - Content moderation
ROLES.TRAFFIC_MANAGER = 'Traffic Manager' - Traffic management
ROLES.EMERGENCY_MANAGER = 'Emergency Manager' - Emergency handling
ROLES.HEALTH_MANAGER = 'Health Manager' - Health/medical data
ROLES.WASTE_MANAGER = 'Waste Manager' - Waste management
ROLES.VOLUNTEER_COORDINATOR = 'Volunteer Coordinator' - Volunteer coordination
ROLES.EVENT_ORGANIZER = 'Event Organizer' - Event management
ROLES.FINANCIAL_MANAGER = 'Financial Manager' - Financial operations
ROLES.APARTMENT_MANAGER = 'Apartment Manager' - Apartment listings
ROLES.WEATHER_ANALYST = 'Weather Analyst' - Weather analysis
ROLES.CITIZEN = 'Citizen' - Regular users

NOTE: requireRole now checks role strings instead of IDs
```

// ============================================
// MULTIPLE MIDDLEWARES (if needed)
// ============================================

```typescript
import { authMiddleware } from '@/middlewares';

export const protectedRoute = createPostRoute({
  path: '/protected',
  summary: 'A protected endpoint',
  requestSchema: z.object({ data: z.string() }),
  responseSchema: z.object({ success: z.boolean() }),
  tags: ['Protected'],
  // Multiple middlewares - auth first, then role check
  middleware: [authMiddleware, requireRole(ROLES.ADMIN)],
});
```
