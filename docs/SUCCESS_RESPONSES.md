# Success Response Helper

Simple utility for consistent API responses.

## Usage

```typescript
import { successResponse } from "@/utils/response";

// Basic success with data
return successResponse(c, { user });

// Custom status code
return successResponse(c, { id: "123" }, 201);

// Empty success response
return successResponse(c, null);
```

## Function

```typescript
export function successResponse<T>(
  c: Context,
  data: T,
  statusCode: number = 200,
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  return c.json(response, statusCode);
}
```

## Examples

```typescript
// GET /users/123
return successResponse(c, {
  user: { id: "123", name: "John" }
});
// Response: { "success": true, "data": { "user": {...} }, "timestamp": "..." }

// POST /users
return successResponse(c, { id: "456" }, 201);
// Response: { "success": true, "data": { "id": "456" }, "timestamp": "..." }

// DELETE /users/123
return successResponse(c, null);
// Response: { "success": true, "data": null, "timestamp": "..." }
```