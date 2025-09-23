export abstract class BaseError extends Error {
  abstract readonly statusCode: number;
  abstract readonly name: string;
  abstract readonly isOperational: boolean;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }

  toJSON(): {
    name: string;
    message: string;
    statusCode: number;
    stack?: string;
  } {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}
