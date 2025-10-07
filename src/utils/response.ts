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
