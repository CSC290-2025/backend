# Architecture Guide

## ARCHITECTURE PATTERN

### 1. FOLDER STRUCTURE

```tree
Substitue [feature] with specific names.

[team-module]/
├── types/
│   ├── [feature].types.ts
│   └── index.ts (export * from './[feature].types')
├── models/ (interacting with DB)
│   ├── [feature].model.ts
│   └── index.ts (export * as [Feature]Model from './[feature].model')
├── services/ (mostly business logic)
│   ├── [feature].service.ts
│   └── index.ts (export * as [Feature]Service from './[feature].service')
├── controllers/
│   ├── [feature].controller.ts
│   └── index.ts (export * as [Feature]Controller from './[feature].controller')
└── routes/
    ├── [feature].routes.ts
    └── index.ts (export { [feature]Routes } from './[feature].routes')
```

### 2. IMPORT STRUCTURE

Feel free to use my example User structure (available in `/src`) as a guideline.

- `types/user.types.ts` (defines interfaces, exports at end)
- `models/user.model.ts` (imports from `@/types`, exports functions at end)
- `services/user.service.ts` (imports from `@/models, @/types`, exports at end)
- `controllers/user.controller.ts` (imports from `@/services`, exports at end)
- `routes/user.routes.ts` (imports from `@/controllers`)

### 3. CODE PATTERNS

#### TYPES PATTERN (user.types.ts)

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}
interface CreateUserData {
  email: string;
  name: string;
}
export { User, CreateUserData };
```

#### MODELS PATTERN (user.model.ts)

```typescript
import type { User, CreateUserData } from "@/types";

const findById = async (id: string): Promise<User | null> => {
  // db logic here
};
const create = async (data: CreateUserData): Promise<User> => {
  // db logic here
};

// etc, etc.
export { findById, create };
```

#### SERVICES PATTERN (user.service.ts)

```typescript
import { UserModel } from "@/models";
import type { User, CreateUserData } from "@/types";
import { NotFoundError, ValidationError, ConflictError } from "@/errors";

const getUserById = async (id: string): Promise<User> => {
  const user = await UserModel.findById(id);
  if (!user) throw new NotFoundError("User not found");
  return user;
};
const createUser = async (data: CreateUserData): Promise<User> => {
  const existingUser = await UserModel.findByEmail(data.email);

  // (actually, prisma will handle this type of conflict error automatically
  // via handlePrismaError(error), just adding to show as an example
  // you have to catch err using handlePrismaError in model tho)
  if (existingUser) throw new ConflictError("Email already exists");

  if (!data.email || !data.email.includes("@")) {
    throw new ValidationError("Invalid email format");
  }

  return await UserModel.create(data);
};
export { getUserById, createUser };
```

#### CONTROLLERS PATTERN (user.controller.ts)

```typescript
import type { Context } from "hono";
import { UserService } from "@/services";
import { successResponse } from "@/utils/response";
import { NotFoundError } from "@/errors";

const getUser = async (c: Context) => {
  const id = c.req.param("id");
  const user = await UserService.getUserById(id);
  return successResponse(c, { user });
};
const createUser = async (c: Context) => {
  const body = await c.req.json();
  const user = await UserService.createUser(body);
  return successResponse(c, { user }, 201, "User created successfully");
};
export { getUser, createUser };
```

#### ROUTES PATTERN (user.routes.ts)

```typescript
import { Hono } from "hono";
import { UserController } from "@/controllers";

const userRoutes = new Hono();
userRoutes.get("/:id", UserController.getUser);
userRoutes.post("/", UserController.createUser);
export { userRoutes };
```

#### INDEX FILES PATTERN

```typescript
// [team-module]/types/index.ts
export * from "./[feature].types";

// [team-module]/models/index.ts
export * as [Feature]Model from "./[feature].model";

// [team-module]/services/index.ts
export * as [Feature]Service from "./[feature].service";

// [team-module]/controllers/index.ts
export * as [Feature]Controller from "./[feature].controller";

// [team-module]/routes/index.ts
export { [Feature]Routes } from "./[feature].routes";
```

### 4. ERROR HANDLING PATTERNS

#### Custom errors (throw directly, middleware catches)

```typescript
const getUser = async (c: Context) => {
  const user = await UserService.getUserById(id);
  if (!user) throw new NotFoundError("User not found");
  return successResponse(c, { user });
};
```

#### DB operations with Prisma error handling

(mostly in model where DB interactions are; unique constraint, conflict errors etc.)

```typescript
const createUser = async (c: Context) => {
  try {
    const user = await prisma.user.create({ data: userData });
    return successResponse(c, user, 201, "User created successfully");
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
import { UserModel } from "@/models"; // Gets UserModel namespace
import { UserService } from "@/services"; // Gets UserService namespace
import { UserController } from "@/controllers"; // Gets UserController namespace
import type { User, CreateUserData } from "@/types"; // Gets specific types

// Usage:
UserModel.findById(id);
UserService.getUserById(id);
UserController.getUser;
```
