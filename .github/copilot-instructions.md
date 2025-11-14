# Copilot Instructions - Smart City Backend

## Architecture Overview

This is a **Hono-based Node.js API** with **Prisma ORM** following a modular, layered architecture. The codebase uses **TypeScript** with path aliases (`@/*` → `src/*`) and is structured around domain modules under `src/modules/`.

### Core Stack

- **Framework**: Hono with OpenAPI support (`@hono/zod-openapi`)
- **Database**: PostgreSQL via Prisma (with Accelerate extension)
- **Validation**: Zod schemas for type-safe request/response
- **Documentation**: Auto-generated Swagger UI at `/swagger`

### Critical Prisma Configuration

- Prisma client is **custom-generated** to `src/generated/prisma` (not default `node_modules`)
- Always import from `@/generated/prisma`, never `@prisma/client`
- Schema includes PostgreSQL extensions: `postgis`, `uuid_ossp`

## Module Structure Pattern

Every feature follows this **strict 6-layer hierarchy**:

```
modules/[TeamName]/
├── types/           # Interfaces only, no logic
├── models/          # Database operations (Prisma queries)
├── services/        # Business logic
├── controllers/     # Request handlers
├── routes/          # Route definitions
└── schemas/         # Zod schemas + OpenAPI route configs
```

### Import Flow Rules

- **Types**: Import from `@/types` (defines interfaces)
- **Models**: Import from `@/models` (uses types)
- **Services**: Import from `@/services` and `@/models` (uses both)
- **Controllers**: Import from `@/services` only (never models directly)
- **Routes**: Import from `@/controllers` and `@/schemas`

**Never skip layers** - controllers must never call models directly.

### Index File Convention

Each layer has an `index.ts` using namespace exports:

```typescript
// models/index.ts
export * as ProductModel from './product.model';

// services/index.ts
export * as ProductService from './product.service';
```

## Error Handling System

### Custom Error Pattern

Throw custom errors **directly** - the global error handler (in `app.onError()`) automatically catches and formats them:

```typescript
import { NotFoundError, ValidationError, ConflictError } from '@/errors';

// In services - throw directly, no try-catch needed
const product = await ProductModel.findById(id);
if (!product) throw new NotFoundError('Product not found');
```

### Available Error Types

- `ValidationError` (400) - Bad input
- `NotFoundError` (404) - Resource missing
- `UnauthorizedError` (401) - Auth required
- `ForbiddenError` (403) - No permission
- `ConflictError` (409) - Unique constraint violations
- `DatabaseError` (500) - DB operation failures

### Prisma Error Handling

In models, wrap Prisma calls with `handlePrismaError()`:

```typescript
import { handlePrismaError } from '@/errors';

try {
  return await prisma.product.create({ data });
} catch (error) {
  handlePrismaError(error); // Auto-converts Prisma errors
}
```

## Response Formatting

**Always** use `successResponse()` from `@/utils/response`:

```typescript
import { successResponse } from '@/utils/response';

// Standard response
return successResponse(c, { product });

// With status code and message
return successResponse(c, { id }, 201, 'Product created successfully');
```

## Routing: Two Options

### Option 1: OpenAPI Routes (Documented in Swagger)

Use for public APIs that need documentation:

1. Define schemas in `schemas/[feature].schemas.ts` using OpenAPI helpers
2. Create setup function in `routes/[feature].openapi.routes.ts`
3. Register in `src/routes/index.ts` under "OpenAPI Routes" section

```typescript
// schemas/product.schemas.ts
import { createGetRoute, createPostRoute } from '@/utils/openapi-helpers';

export const getProductRoute = createGetRoute({
  path: '/products/{id}',
  summary: 'Get product by ID',
  responseSchema: ProductSchema,
  params: z.object({ id: z.string().uuid() }),
  tags: ['Products'],
});
```

### Option 2: Normal Hono Routes (Not Documented)

Use for internal/admin endpoints:

```typescript
// routes/product.routes.ts
const productRoutes = new Hono();
productRoutes.get('/:id', ProductController.getProduct);

// Mount in src/routes/index.ts
app.route('/products', productRoutes);
```

## Development Workflow

### Essential Commands

```bash
pnpm dev              # Start dev server with hot reload (tsx watch)
pnpm migrate          # Run Prisma migrations
pnpm build            # Build with tsup
pnpm lint:fix         # Auto-fix ESLint issues
```

### Database Workflow

1. Modify `prisma/schema.prisma`
2. Run `pnpm migrate` (generates migration + updates client)
3. Generated client appears in `src/generated/prisma`

### Testing Workflow

- Server runs on `http://localhost:3000` (configured in `src/config/env.ts`)
- Swagger docs at `http://localhost:3000/swagger`
- Health check at `http://localhost:3000/`

## Key Conventions

### Environment Variables

- Managed via `dotenv` in `src/config/env.ts`
- Database URL must be in `.env` as `DATABASE_URL`

### Module Naming

- Team modules use PascalCase folder names (e.g., `Financial/`, not `financial/`)
- Example module at `modules/_example/` - excluded from TypeScript compilation

### Type Safety

- Controller params: `c.req.param('id')` for path params
- Body parsing: `await c.req.json()` (no middleware needed)
- Query params: `c.req.query()` returns object

### OpenAPI Helpers

Four pre-built route creators in `src/utils/openapi-helpers.ts`:

- `createGetRoute` - GET endpoints
- `createPostRoute` - POST endpoints
- `createPutRoute` - PUT endpoints
- `createDeleteRoute` - DELETE endpoints

Each auto-generates success/error response schemas wrapped in:

```json
{
  "success": true,
  "data": { ... },
  "message": "optional",
  "timestamp": "2025-10-27T..."
}
```

## Critical Files

- `src/index.ts` - App entry point, configures OpenAPIHono + Swagger
- `src/routes/index.ts` - Route registration hub
- `src/config/client.ts` - Prisma client with Accelerate extension
- `src/middlewares/error.ts` - Global error handler
- `docs/ARCHITECTURE_GUIDE.md` - Complete architectural reference
- `docs/ERROR_HANDLING.md` - Detailed error system docs
- `docs/ROUTING_GUIDE.md` - Full routing examples

## Common Pitfalls

1. **Don't** import from `@prisma/client` - use `@/generated/prisma`
2. **Don't** skip layers - controllers → services → models
3. **Don't** wrap routes in try-catch - global handler does this
4. **Don't** return raw JSON - use `successResponse()` helper
5. **Don't** forget to export in `index.ts` files using namespace pattern
