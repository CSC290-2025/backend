# API Development Architecture Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT FLOW                        │
│                                                                 │
│  1. SCHEMAS (Data Contract)                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ • Request/Response validation                           │    │
│  │ • OpenAPI route definitions                             │    │
│  │ • Zod schemas for type safety                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                  │
│  2. TYPES (TypeScript Safety)                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ • Inferred from Zod schemas                             │    │
│  │ • Type definitions for all data structures              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                  │
│  3. MODELS (Data Layer)                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ • Prisma database operations                            │    │
│  │ • CRUD functions                                        │    │
│  │ • Data transformation                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                  │
│  4. SERVICES (Business Logic)                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ • Validation logic                                      │    │
│  │ • Business rules                                        │    │
│  │ • Error handling                                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                  │
│  5. CONTROLLERS (Request Handling)                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ • HTTP request parsing                                  │    │
│  │ • Service orchestration                                 │    │
│  │ • Response formatting                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                  │
│  6. ROUTES (API Registration)                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ • OpenAPI route binding                                 │    │
│  │ • Endpoint registration                                 │    │
│  │ • Swagger documentation                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure & Dependencies

```
src/modules/Financial/
├── schemas/
│   └── wallet.schemas.ts        - 1. START HERE (API Contract)
│       ├── Zod validation schemas
│       ├── OpenAPI route definitions
│       └── exports: WalletSchemas
│
├── types/
│   └── wallet.types.ts          - 2. Type Definitions
│       ├── imports: schemas
│       └── exports: TypeScript types
│
├── models/
│   └── wallet.model.ts          - 3. Database Layer
│       ├── imports: types
│       ├── Prisma operations
│       └── exports: CRUD functions
│
├── services/
│   └── wallet.service.ts        - 4. Business Logic
│       ├── imports: types, models
│       ├── Validation & business rules
│       └── exports: service functions
│
├── controllers/
│   └── wallet.controller.ts     - 5. HTTP Handling
│       ├── imports: services
│       ├── Request/response handling
│       └── exports: controller functions
│
├── routes/
│   └── wallet.openapi.routes.ts - 6. Route Registration
│       ├── imports: schemas, controllers
│       ├── OpenAPI binding
│       └── exports: setupRoutes function
│
└── index.ts                     - Module exports
    └── exports: all public interfaces
```

## Layer Responsibilities

| Layer           | Responsibility                 | Should NOT                  |
| --------------- | ------------------------------ | --------------------------- |
| **Schemas**     | API contract, validation rules | Business logic, DB calls    |
| **Types**       | Type safety, interfaces        | Logic, transformations      |
| **Models**      | Database operations, CRUD      | Business validation, HTTP   |
| **Services**    | Business logic, validation     | HTTP parsing, DB queries    |
| **Controllers** | HTTP handling, orchestration   | Business rules, direct DB   |
| **Routes**      | Endpoint registration          | Data processing, validation |

## Best Practices

### RECOMMENDED

- Follow the order: Schemas → Types → Models → Services → Controllers → Routes
- Use consistent naming conventions
- Handle errors at appropriate layers
- Keep functions focused and single-purpose
- Use TypeScript types everywhere
- Write tests for each layer

### AVOID

- Skip layers or combine responsibilities
- Put business logic in controllers
- Put HTTP logic in services
- Access database directly from controllers
- Ignore error handling
- Mix sync and async patterns inconsistently

## Testing Strategy

```
Unit Tests:
├── models/     - Test database operations
├── services/   - Test business logic
└── controllers - Test request handling

Integration Tests:
└── routes/     - Test full API endpoints

E2E Tests:
└── Complete user workflows
```

This architecture ensures maintainable, scalable, and testable code!
