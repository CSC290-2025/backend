# Custom Error Handling Documentation

## Architecture Overview

The error handling system consists of:

- **Base Error Class**: Abstract foundation for all custom errors
- **Specific Error Types**: Pre-defined errors for common scenarios
- **Prisma Error Handler**: Automatic translation of database errors
- **Error Middleware**: Centralized error processing and response formatting

- More custom error handlers can be added using [Custom Error Guide](CUSTOM_ERROR_GUIDE.md).

## Error Classes

### BaseError (Abstract)

The foundation class that all custom errors extend from:

```typescript
import { BaseError } from "@/errors";

// All errors extend this base class
abstract class BaseError extends Error {
  abstract readonly statusCode: number;
  abstract readonly name: string;
  abstract readonly isOperational: boolean;
}
```

### Available Error Types

```typescript
import {
  ValidationError, // 400 - Bad Request
  NotFoundError, // 404 - Not Found
  UnauthorizedError, // 401 - Unauthorized
  ForbiddenError, // 403 - Forbidden
  ConflictError, // 409 - Conflict
  DatabaseError, // 500 - Database Issues
  InternalServerError, // 500 - Unexpected Errors
} from "@/errors";
```

## Usage Examples

### Basic Error Throwing

```typescript
import { NotFoundError, ValidationError } from "@/errors";

// In your route handlers or services
async function getUserById(id: string) {
  if (!id) {
    throw new ValidationError("User ID is required");
  }

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  return user;
}
```

### Using with Global Error Handler

```typescript
import { ValidationError, NotFoundError } from "@/errors";

// Errors are automatically caught by app.onError(errorHandler)
const getUser = async (c) => {
  const { id } = c.req.param();

  if (!id) {
    throw new ValidationError("User ID is required");
  }

  const user = await getUserById(id);
  return c.json({ user });
};
```

### Database Error Handling

```typescript
import { handlePrismaError } from "@/errors";

async function createUser(userData: CreateUserData) {
  try {
    return await prisma.user.create({
      data: userData,
    });
  } catch (error) {
    // Automatically converts Prisma errors to appropriate custom errors
    handlePrismaError(error);
  }
}
```

## Error Response Format

All errors are automatically formatted into consistent JSON responses:

```typescript
// Successful error handling produces:
{
  "name": "ValidationError",
  "message": "User ID is required",
  "statusCode": 400
}

// In development, stack traces are included for InternalServerError:
{
  "name": "InternalServerError",
  "message": "Something went wrong",
  "statusCode": 500,
  "stack": "Error: Something went wrong\n    at ..."
}
```

## Middleware Integration

### Error Handler Middleware

```typescript
import { errorHandler } from "@/middlewares";

// The error handler automatically:
// 1. Catches all thrown errors
// 2. Formats BaseError instances properly
// 3. Converts unknown errors to InternalServerError
// 4. Provides appropriate logging in development
```

### Global Error Handler

```typescript
import { errorHandler } from "@/middlewares";

// Global error handler automatically:
// 1. Catches all thrown errors across the entire app
// 2. Formats BaseError instances properly
// 3. Converts unknown errors to InternalServerError
// 4. Provides appropriate logging in development

// Set up in your main app file:
app.onError(errorHandler);
```

## Prisma Error Mapping

The system automatically maps Prisma error codes to appropriate custom errors:

| Prisma Code                                  | Custom Error    | Description                  |
| -------------------------------------------- | --------------- | ---------------------------- |
| P2001, P2015, P2018, P2025                   | NotFoundError   | Record not found             |
| P2002, P2034                                 | ConflictError   | Unique constraint violations |
| P2000, P2003-P2007, P2011-P2013, P2019-P2020 | ValidationError | Data validation issues       |
| P2008-P2010, P2016, P2021-P2028              | DatabaseError   | Database operation failures  |

## Best Practices

### 1. Use Specific Error Types

```typescript
// Good
throw new ValidationError("Email format is invalid");
throw new NotFoundError("User not found");

// Avoid
throw new Error("Something went wrong");
```

### 2. Provide Meaningful Messages

```typescript
// Good
throw new ValidationError("Password must be at least 8 characters long");

// Less helpful
throw new ValidationError("Invalid input");
```

### 3. Rely on Global Error Handling

```typescript
// No need to wrap handlers - global error handler catches everything
const protectedRoute = async (c) => {
  // Your route logic here - errors automatically handled
};
```

### 4. Let Prisma Errors Auto-Convert

```typescript
// Good - let the system handle Prisma errors
try {
  return await prisma.user.create({ data });
} catch (error) {
  handlePrismaError(error);
}

// Unnecessary - don't manually check Prisma error codes
```

## Development vs Production

- **Development**: Full error details and stack traces are exposed
- **Production**: Sensitive error details are hidden, generic messages shown
- **Logging**: Unhandled errors are logged with full context in development
