# OpenAPI Setup Guide

## Structure

```tree
src/
├── schemas/          # Zod schemas + routes
├── routes/           # Route setup
└── utils/openapi-helpers.ts
```

## Adding New Resource

### 1. Create Schema File

`src/schemas/post.schemas.ts`:

```typescript
import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';

const PostSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  content: z.string(),
});

const CreatePostSchema = z.object({
  title: z.string(),
  content: z.string(),
});

const PostIdParam = z.object({
  id: z.uuid(),
});

const getPostsRoute = createGetRoute({
  path: '/posts',
  summary: 'Get posts',
  responseSchema: z.array(PostSchema),
  tags: ['Posts'],
});

const getPostRoute = createGetRoute({
  path: '/posts/{id}',
  summary: 'Get post',
  responseSchema: PostSchema,
  params: PostIdParam,
  tags: ['Posts'],
});

const createPostRoute = createPostRoute({
  path: '/posts',
  summary: 'Create post',
  requestSchema: CreatePostSchema,
  responseSchema: PostSchema,
  tags: ['Posts'],
});

const updatePostRoute = createPutRoute({
  path: '/posts/{id}',
  summary: 'Update post',
  requestSchema: CreatePostSchema.partial(),
  responseSchema: PostSchema,
  params: PostIdParam,
  tags: ['Posts'],
});

const deletePostRoute = createDeleteRoute({
  path: '/posts/{id}',
  summary: 'Delete post',
  params: PostIdParam,
  tags: ['Posts'],
});

export {
  PostSchema,
  CreatePostSchema,
  PostIdParam,
  getPostsRoute,
  getPostRoute,
  createPostRoute,
  updatePostRoute,
  deletePostRoute,
};
```

### 2. Export Schema

Add to `src/schemas/index.ts`:

```typescript
export * as PostSchemas from './post.schemas';
```

### 3. Setup Routes

`src/routes/post.routes.ts`

```typescript
import type { OpenAPIHono } from '@hono/zod-openapi';
import { PostSchemas } from '@/schemas';
import { PostController } from '@/controllers';

const setupPostRoutes = (app: OpenAPIHono) => {
  app.openapi(PostSchemas.getPostsRoute, PostController.getPosts);
  app.openapi(PostSchemas.getPostRoute, PostController.getPost);
  app.openapi(PostSchemas.createPostRoute, PostController.createPost);
  app.openapi(PostSchemas.updatePostRoute, PostController.updatePost);
  app.openapi(PostSchemas.deletePostRoute, PostController.deletePost);
};

export { setupPostRoutes };
```

### 4. Register Routes

Add to `src/routes/index.ts`

```typescript
import { setupPostRoutes } from './post.routes';

export const setupRoutes = (app: OpenAPIHono) => {
  // previous routes;
  setupPostRoutes(app);
};
```

## Available Helpers

- `createGetRoute` - GET endpoints
- `createPostRoute` - POST endpoints
- `createPutRoute` - PUT endpoints
- `createDeleteRoute` - DELETE endpoints

## Tags Usage

All helper functions support an optional `tags` parameter for OpenAPI documentation organization:

```typescript
const getUsersRoute = createGetRoute({
  path: '/users',
  summary: 'Get all users',
  responseSchema: z.array(UserSchema),
  tags: ['Users'], // Groups endpoints in OpenAPI docs
});

const createUserRoute = createPostRoute({
  path: '/users',
  summary: 'Create user',
  requestSchema: CreateUserSchema,
  responseSchema: UserSchema,
  tags: ['Users', 'Authentication'], // Multiple tags supported
});
```

Tags help organize your API documentation by grouping related endpoints together in the OpenAPI/Swagger UI.

## Type Inference Pattern

Just simply infer types from Schemas using Zod

`src/types/post.types.ts`:

```typescript
import { z } from 'zod';
import {
  PostSchema,
  CreatePostSchema,
  PostIdParam,
} from '@/schemas/post.schemas';

export type Post = z.infer<typeof PostSchema>;
export type CreatePost = z.infer<typeof CreatePostSchema>;
export type PostId = z.infer<typeof PostIdParam>;
```

```typescript
export type ResourceName = z.infer<typeof ResourceSchema>;
export type CreateResourceName = z.infer<typeof CreateResourceSchema>;
```

