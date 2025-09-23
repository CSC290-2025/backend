import { BaseError } from "./base";

export class ValidationError extends BaseError {
  readonly name = "ValidationError";
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string = "Validation failed") {
    super(message);
  }
}

export class NotFoundError extends BaseError {
  readonly name = "NotFoundError";
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(message: string = "Resource not found") {
    super(message);
  }
}

export class UnauthorizedError extends BaseError {
  readonly name = "UnauthorizedError";
  readonly statusCode = 401;
  readonly isOperational = true;

  constructor(message: string = "Unauthorized access") {
    super(message);
  }
}

export class ForbiddenError extends BaseError {
  readonly name = "ForbiddenError";
  readonly statusCode = 403;
  readonly isOperational = true;

  constructor(message: string = "Access forbidden") {
    super(message);
  }
}

export class ConflictError extends BaseError {
  readonly name = "ConflictError";
  readonly statusCode = 409;
  readonly isOperational = true;

  constructor(message: string = "Resource conflict") {
    super(message);
  }
}

export class DatabaseError extends BaseError {
  readonly name = "DatabaseError";
  readonly statusCode = 500;
  readonly isOperational = true;

  constructor(message: string = "Database operation failed") {
    super(message);
  }
}

export class InternalServerError extends BaseError {
  readonly name = "InternalServerError";
  readonly statusCode = 500;
  readonly isOperational = false;

  constructor(message: string = "Internal server error") {
    super(message);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
    };
  }
}
