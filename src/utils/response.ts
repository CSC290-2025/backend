import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    name: string;
    message: string;
    statusCode: number;
  };
  timestamp: string;
}

export function successResponse<T, S extends ContentfulStatusCode = 200>(
  c: Context,
  data: T,
  statusCode?: S,
  message?: string
) {
  const response = {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };

  return c.json(response, statusCode || 200);
}

export function errorResponse(
  c: Context,
  message: string,
  statusCode: ContentfulStatusCode = 500,
  errorName?: string
) {
  const response: ApiResponse = {
    success: false,
    error: {
      name: errorName || 'API_ERROR',
      message: message,
      statusCode: statusCode,
    },
    timestamp: new Date().toISOString(),
  };
  return c.json(response, statusCode);
}
