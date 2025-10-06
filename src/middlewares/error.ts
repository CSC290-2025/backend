import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { BaseError, InternalServerError } from '@/errors';
import config from '@/config/env';

export function errorHandler(err: Error, c: Context) {
  if (err instanceof BaseError) {
    return c.json(err.toJSON(), err.statusCode as ContentfulStatusCode);
  }

  const internalError = new InternalServerError(
    config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  );

  if (config.nodeEnv === 'development') {
    console.error('Unhandled error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }

  return c.json(
    internalError.toJSON(),
    internalError.statusCode as ContentfulStatusCode
  );
}
