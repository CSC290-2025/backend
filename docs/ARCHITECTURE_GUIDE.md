# Architecture Guide

## ARCHITECTURE PATTERN

### 1. FOLDER STRUCTURE

```tree
Substitue [feature] with specific names.

[team-module]/
├── types/
│   ├── [feature].types.ts
│   └── env.ts (export * from './[feature].types')
├── models/ (interacting with DB)
│   ├── [feature].model.ts
│   └── env.ts (export * as [Feature]Model from './[feature].model')
├── services/ (mostly business logic)
│   ├── [feature].service.ts
│   └── env.ts (export * as [Feature]Service from './[feature].service')
├── controllers/
│   ├── [feature].controller.ts
│   └── env.ts (export * as [Feature]Controller from './[feature].controller')
└── routes/
    ├── [feature].routes.ts
    └── env.ts (export { [feature]Routes } from './[feature].routes')
```

### 2. IMPORT STRUCTURE

Example structure for a feature module:

- `types/[feature].types.ts` (defines interfaces, exports at end)
- `models/[feature].model.ts` (imports from `@/types`, exports functions at end)
- `services/[feature].service.ts` (imports from `@/models, @/types`, exports at end)
- `controllers/[feature].controller.ts` (imports from `@/services`, exports at end)
- `routes/[feature].openapi.routes.ts` (imports from `@/controllers`, `@/schemas`) for OpenAPI
- `routes/[feature].routes.ts` (imports from `@/controllers`) for Normal Hono routes

### 3. CODE PATTERNS

#### TYPES PATTERN (product.types.ts)

```typescript
interface Product {
  id: string;
  title: string;
  price: number;
}
interface CreateProductData {
  title: string;
  price: number;
}
export { Product, CreateProductData };
```

#### MODELS PATTERN (product.model.ts)

```typescript
import type { Product, CreateProductData } from "@/types";

const findById = async (id: string): Promise<Product | null> => {
  // db logic here
};
const create = async (data: CreateProductData): Promise<Product> => {
  // db logic here
};

// etc, etc.
export { findById, create };
```

#### SERVICES PATTERN (product.service.ts)

```typescript
import { ProductModel } from "@/models";
import type { Product, CreateProductData } from "@/types";
import { NotFoundError, ValidationError, ConflictError } from "@/errors";

const getProductById = async (id: string): Promise<Product> => {
  const product = await ProductModel.findById(id);
  if (!product) throw new NotFoundError("Product not found");
  return product;
};
const createProduct = async (data: CreateProductData): Promise<Product> => {
  const existingProduct = await ProductModel.findByTitle(data.title);

  // (actually, prisma will handle this type of conflict error automatically
  // via handlePrismaError(error), just adding to show as an example
  // you have to catch err using handlePrismaError in model tho)
  if (existingProduct) throw new ConflictError("Product title already exists");

  if (!data.title || data.title.trim().length < 2) {
    throw new ValidationError("Title must be at least 2 characters");
  }

  return await ProductModel.create(data);
};
export { getProductById, createProduct };
```

#### CONTROLLERS PATTERN (product.controller.ts)

```typescript
import type { Context } from "hono";
import { ProductService } from "@/services";
import { successResponse } from "@/utils/response";

const getProduct = async (c: Context) => {
  const id = c.req.param("id");
  const product = await ProductService.getProductById(id);
  return successResponse(c, { product });
};
const createProduct = async (c: Context) => {
  const body = await c.req.json();
  const product = await ProductService.createProduct(body);
  return successResponse(c, { product }, 201, "Product created successfully");
};
export { getProduct, createProduct };
```

#### ROUTES PATTERN

Learn details in [Routing Guide](/docs/ROUTING_GUIDE.md)

**Option 1: Normal Hono Routes** (product.routes.ts) - Not documented in Swagger:

```typescript
import { Hono } from "hono";
import { ProductController } from "@/controllers";

const productRoutes = new Hono();

productRoutes.get("/:id", ProductController.getProduct);
productRoutes.post("/", ProductController.createProduct);

export { productRoutes };
```

**Option 2: OpenAPI Routes** (post.openapi.routes.ts) - Documented in Swagger:

```typescript
import type { OpenAPIHono } from "@hono/zod-openapi";
import { PostSchemas } from "@/schemas";
import { PostController } from "@/controllers";

const setupPostRoutes = (app: OpenAPIHono) => {
  app.openapi(PostSchemas.getPostRoute, PostController.getPost);
  app.openapi(PostSchemas.createPostRoute, PostController.createPost);
};

export { setupPostRoutes };
```

**Mounting Routes** (src/routes/index.tsx):

```typescript
import type { OpenAPIHono } from "@hono/zod-openapi";
import { setupPostRoutes } from "./post.openapi.routes";
import { productRoutes } from "@/modules/_example";

export const setupRoutes = (app: OpenAPIHono) => {
  // OpenAPI Routes (in Swagger)
  setupPostRoutes(app);

  // Normal Hono Routes (not in Swagger)
  app.route("/products", productRoutes);
};
```

#### INDEX FILES PATTERN

```typescript
// [team-module]/types/env.ts
export * from "./[feature].types";

// [team-module]/models/env.ts
export * as [Feature]Model from "./[feature].model";

// [team-module]/services/env.ts
export * as [Feature]Service from "./[feature].service";

// [team-module]/controllers/env.ts
export * as [Feature]Controller from "./[feature].controller";

// [team-module]/routes/env.ts
export { [Feature]Routes } from "./[feature].routes";
```

### 4. ERROR HANDLING PATTERNS

#### Custom errors (throw directly, middleware catches)

```typescript
const getProduct = async (c: Context) => {
  const product = await ProductService.getProductById(id);
  if (!product) throw new NotFoundError("Product not found");
  return successResponse(c, { product });
};
```

#### DB operations with Prisma error handling

(mostly in model where DB interactions are; unique constraint, conflict errors etc.)

```typescript
const createProduct = async (c: Context) => {
  try {
    const product = await prisma.product.create({ data: productData });
    return successResponse(c, product, 201, "Product created successfully");
  } catch (error) {
    handlePrismaError(error);
  }
};
```

#### Validation errors

```typescript
const validateData = async (c: Context) => {
  const body = await c.req.json();
  if (!body.email) throw new ValidationError("Email is required");
  return successResponse(c, { message: "Valid" });
};
```

### 5. IMPORT EXAMPLES

```typescript
// Clean imports using index files:
import type { Product, CreateProductData } from "@/types"; // Gets specific types
import { ProductModel } from "@/models"; // Gets ProductModel namespace
import { ProductService } from "@/services"; // Gets ProductService namespace
import { ProductController } from "@/controllers"; // Gets ProductController namespace

// Usage:
ProductModel.findById(id);
ProductService.getProductById(id);
ProductController.getProduct;
```
