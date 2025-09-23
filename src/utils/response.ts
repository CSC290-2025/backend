import type { Context } from "hono";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    name: string;
    message: string;
    statusCode: number;
  };
  timestamp: string;
}

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

  return c.json(response, statusCode as any);
}
