# Success Response Helper

Simple utility for consistent API responses.

## Usage

```typescript
import { successResponse } from "@/utils/response";

// Basic success with data
return successResponse(c, { user });

// Custom status code
return successResponse(c, { id: "123" }, 201);

// With custom message
return successResponse(c, { user }, 200, "User retrieved successfully");

// Empty success response
return successResponse(c, null);
```

## Function

```typescript
export function successResponse<T>(
  c: Context,
  data: T,
  statusCode: ContentfulStatusCode = 200,
  message?: string,
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };

  return c.json(response, statusCode);
}
```

## Examples

```typescript
// GET /users/123
return successResponse(c, {
  user: { id: "123", name: "John" },
});
// Response: { "success": true, "data": { "user": {...} }, "timestamp": "..." }

// POST /users with custom message
return successResponse(c, { id: "456" }, 201, "User created successfully");
// Response: { "success": true, "data": { "id": "456" }, "message": "User created successfully", "timestamp": "..." }

// DELETE /users/123
return successResponse(c, null);
// Response: { "success": true, "data": null, "timestamp": "..." }
```
