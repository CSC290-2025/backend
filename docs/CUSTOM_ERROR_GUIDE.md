# Adding Custom Error Types Guide

This guide shows you how to extend the existing error handling system with your own custom error types for domain-specific scenarios.

## Quick Start

1. **Create your custom error class** extending `BaseError`
2. **Define required properties** (name, statusCode, isOperational)
3. **Export from appropriate module**
4. **Use in your application code**

## Creating Custom Error Classes

### Basic Custom Error

```typescript
import { BaseError } from "@/errors";

export class PaymentFailedError extends BaseError {
  readonly name = "PaymentFailedError";
  readonly statusCode = 402; // Payment Required
  readonly isOperational = true;

  constructor(message: string = "Payment processing failed") {
    super(message);
  }
}
```

### Custom Error with Additional Properties

```typescript
import { BaseError } from "@/errors";

export class RateLimitError extends BaseError {
  readonly name = "RateLimitError";
  readonly statusCode = 429; // Too Many Requests
  readonly isOperational = true;

  constructor(
    message: string = "Rate limit exceeded",
    public readonly retryAfter?: number,
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}
```

### Service-Specific Errors

```typescript
import { BaseError } from "@/errors";

// Email service errors
export class EmailDeliveryError extends BaseError {
  readonly name = "EmailDeliveryError";
  readonly statusCode = 502; // Bad Gateway
  readonly isOperational = true;

  constructor(
    message: string = "Failed to deliver email",
    public readonly provider?: string,
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      provider: this.provider,
    };
  }
}

// File upload errors
export class FileTooLargeError extends BaseError {
  readonly name = "FileTooLargeError";
  readonly statusCode = 413; // Payload Too Large
  readonly isOperational = true;

  constructor(
    message: string = "File size exceeds limit",
    public readonly maxSize?: number,
    public readonly actualSize?: number,
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      maxSize: this.maxSize,
      actualSize: this.actualSize,
    };
  }
}
```

## Error Organization Patterns

### Option 1: Domain-Specific Error Files

Create separate error files for different domains:

```typescript
// src/errors/payment.ts
import { BaseError } from "./base";

export class PaymentFailedError extends BaseError {
  readonly name = "PaymentFailedError";
  readonly statusCode = 402;
  readonly isOperational = true;
}

export class InsufficientFundsError extends BaseError {
  readonly name = "InsufficientFundsError";
  readonly statusCode = 402;
  readonly isOperational = true;
}

// src/errors/auth.ts
import { BaseError } from "./base";

export class TokenExpiredError extends BaseError {
  readonly name = "TokenExpiredError";
  readonly statusCode = 401;
  readonly isOperational = true;
}

export class InvalidCredentialsError extends BaseError {
  readonly name = "InvalidCredentialsError";
  readonly statusCode = 401;
  readonly isOperational = true;
}
```

Update your main index file:

```typescript
// src/errors/index.ts
export { BaseError } from "./base";
export {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  InternalServerError,
} from "./types";
export { handlePrismaError } from "./prisma";

// Export custom domain errors
export * from "./payment";
export * from "./auth";
```

### Option 2: Add to Existing Types File

```typescript
// src/errors/types.ts
// ... existing errors ...

export class PaymentFailedError extends BaseError {
  readonly name = "PaymentFailedError";
  readonly statusCode = 402;
  readonly isOperational = true;

  constructor(message: string = "Payment processing failed") {
    super(message);
  }
}

export class RateLimitError extends BaseError {
  readonly name = "RateLimitError";
  readonly statusCode = 429;
  readonly isOperational = true;

  constructor(
    message: string = "Rate limit exceeded",
    public readonly retryAfter?: number,
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}
```

## Property Guidelines

### Required Properties

```typescript
export class CustomError extends BaseError {
  // Error identifier - should match class name
  readonly name = "CustomError";

  // HTTP status code (100-599)
  readonly statusCode = 400;

  // Whether this is an expected operational error
  readonly isOperational = true; // or false for programming errors
}
```

### HTTP Status Code Reference

| Code | Meaning               | Use Case                              |
| ---- | --------------------- | ------------------------------------- |
| 400  | Bad Request           | Validation errors, malformed requests |
| 401  | Unauthorized          | Authentication required               |
| 402  | Payment Required      | Payment failures                      |
| 403  | Forbidden             | Authorization denied                  |
| 404  | Not Found             | Resource doesn't exist                |
| 409  | Conflict              | Resource conflicts, duplicate data    |
| 413  | Payload Too Large     | File/data size limits                 |
| 422  | Unprocessable Entity  | Semantic validation errors            |
| 429  | Too Many Requests     | Rate limiting                         |
| 500  | Internal Server Error | Unexpected system errors              |
| 502  | Bad Gateway           | External service failures             |
| 503  | Service Unavailable   | Temporary service issues              |

### isOperational Guidelines

```typescript
// Operational errors (expected, recoverable)
readonly isOperational = true;
// Examples: validation errors, not found, rate limits

// Programming errors (unexpected, need fixing)
readonly isOperational = false;
// Examples: type errors, null references, assertion failures
```

## Advanced Custom Error Examples

### Error with Validation Details

```typescript
export class ValidationError extends BaseError {
  readonly name = "ValidationError";
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(
    message: string = "Validation failed",
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}

// Usage
throw new ValidationError("Form validation failed", {
  email: ["Email is required", "Email format is invalid"],
  password: ["Password must be at least 8 characters"],
});
```

### Error with Retry Information

```typescript
export class TemporaryServiceError extends BaseError {
  readonly name = "TemporaryServiceError";
  readonly statusCode = 503;
  readonly isOperational = true;

  constructor(
    message: string = "Service temporarily unavailable",
    public readonly retryAfter?: number,
    public readonly service?: string,
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
      service: this.service,
    };
  }
}
```

### Error with Context Data

```typescript
export class BusinessRuleViolationError extends BaseError {
  readonly name = "BusinessRuleViolationError";
  readonly statusCode = 422;
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly rule: string,
    public readonly context?: Record<string, any>,
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      rule: this.rule,
      context: this.context,
    };
  }
}

// Usage
throw new BusinessRuleViolationError(
  "Cannot delete user with active subscriptions",
  "USER_DELETE_WITH_SUBSCRIPTIONS",
  { userId: "123", activeSubscriptions: 2 },
);
```

## Usage in Application Code

### Service Layer

```typescript
import { PaymentFailedError, RateLimitError } from "@/errors";

export class PaymentService {
  async processPayment(paymentData: PaymentData) {
    try {
      // Payment processing logic
      const result = await this.paymentProvider.charge(paymentData);
      return result;
    } catch (error) {
      if (error.code === "INSUFFICIENT_FUNDS") {
        throw new PaymentFailedError("Insufficient funds in account");
      }
      if (error.code === "CARD_DECLINED") {
        throw new PaymentFailedError("Payment card was declined");
      }
      // Re-throw unexpected errors
      throw error;
    }
  }
}
```

### Route Handlers

```typescript
import { FileTooLargeError } from "@/errors";
import { successResponse } from "@/utils/response";

const uploadFile = async (c) => {
  const file = await c.req.parseBody();

  if (!file || typeof file !== "object") {
    throw new ValidationError("No file provided");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new FileTooLargeError(
      "File size exceeds 10MB limit",
      MAX_FILE_SIZE,
      file.size,
    );
  }

  const result = await fileService.upload(file);
  return successResponse(c, { fileId: result.id }, 201);
};
```

### Middleware Integration

```typescript
import { RateLimitError } from "@/errors";

export function rateLimitMiddleware(requestsPerMinute: number) {
  return async (c, next) => {
    const clientId = getClientId(c);
    const requestCount = await redis.get(`rate_limit:${clientId}`);

    if (requestCount && parseInt(requestCount) >= requestsPerMinute) {
      throw new RateLimitError(
        "Rate limit exceeded",
        60, // retry after 60 seconds
      );
    }

    await next();
  };
}
```

## Testing Custom Errors

```typescript
import { PaymentFailedError } from "@/errors";

describe("PaymentFailedError", () => {
  it("should create error with default message", () => {
    const error = new PaymentFailedError();

    expect(error.name).toBe("PaymentFailedError");
    expect(error.statusCode).toBe(402);
    expect(error.isOperational).toBe(true);
    expect(error.message).toBe("Payment processing failed");
  });

  it("should create error with custom message", () => {
    const error = new PaymentFailedError("Card declined");

    expect(error.message).toBe("Card declined");
  });

  it("should serialize to JSON correctly", () => {
    const error = new PaymentFailedError("Insufficient funds");
    const json = error.toJSON();

    expect(json).toEqual({
      name: "PaymentFailedError",
      message: "Insufficient funds",
      statusCode: 402,
    });
  });
});
```

## Migration Guide

If you have existing error handling, here's how to migrate:

### Before (Generic Error)

```typescript
if (!user) {
  throw new Error("User not found");
}
```

### Before (Manual Error Response)

```typescript
return c.json({ error: "Payment failed" }, 402);
```

### After (Custom Error)

```typescript
if (!user) {
  throw new NotFoundError("User not found");
}
```

```typescript
throw new PaymentFailedError("Payment failed");
// Automatically returns proper JSON response with 402 status
```

## Check List

1. **Extend BaseError** for all custom errors
2. **Define required properties** (name, statusCode, isOperational)
3. **Override toJSON()** if you need additional data in responses
4. **Use meaningful names** that describe the error condition
5. **Choose appropriate HTTP status codes**
6. **Export from errors module** for easy importing
7. **Test your custom errors** to make sure they work properly
