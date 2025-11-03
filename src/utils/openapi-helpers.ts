import { createRoute, z } from '@hono/zod-openapi';

const createResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
    timestamp: z.string(),
  });

const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    name: z.string(),
    message: z.string(),
    statusCode: z.number(),
  }),
  timestamp: z.string(),
});

const successResponse = (schema: z.ZodTypeAny, description: string) => ({
  content: {
    'application/json': { schema: createResponseSchema(schema) },
  },
  description,
});

const errorResponse = (description: string) => ({
  content: {
    'application/json': { schema: errorResponseSchema },
  },
  description,
});

const commonErrors = {
  400: errorResponse('Bad request'),
  404: errorResponse('Not found'),
  409: errorResponse('Conflict'),
};

const createGetRoute = <
  TParams extends z.ZodObject<any>,
  TQuery extends z.ZodObject<any>,
  TResponse extends z.ZodTypeAny,
>(config: {
  path: string;
  summary: string;
  responseSchema: TResponse;
  params?: TParams;
  query?: TQuery;
  tags?: string[];
}) =>
  createRoute({
    method: 'get',
    path: config.path,
    summary: config.summary,
    ...(config.tags && { tags: config.tags }),
    request: {
      ...(config.params && { params: config.params }),
      ...(config.query && { query: config.query }),
    },
    responses: {
      200: successResponse(config.responseSchema, 'Success'),
      404: commonErrors[404],
    },
  });

const createPostRoute = <
  TParams extends z.ZodObject<any> | undefined = undefined,
  TRequest extends z.ZodTypeAny = z.ZodTypeAny,
  TResponse extends z.ZodTypeAny = z.ZodTypeAny,
>(config: {
  path: string;
  summary: string;
  requestSchema: TRequest;
  responseSchema: TResponse;
  params?: TParams;
  tags?: string[];
}) =>
  createRoute({
    method: 'post',
    path: config.path,
    summary: config.summary,
    ...(config.tags && { tags: config.tags }),
    request: {
      ...(config.params && { params: config.params }),
      body: {
        content: {
          'application/json': { schema: config.requestSchema },
        },
      },
    },
    responses: {
      200: successResponse(config.responseSchema, 'Success'),
      201: successResponse(config.responseSchema, 'Created'),
      400: commonErrors[400],
      409: commonErrors[409],
    },
  });

const createPutRoute = <
  TParams extends z.ZodObject<any>,
  TRequest extends z.ZodTypeAny,
  TResponse extends z.ZodTypeAny,
>(config: {
  path: string;
  summary: string;
  requestSchema: TRequest;
  responseSchema: TResponse;
  params: TParams;
  tags?: string[];
}) =>
  createRoute({
    method: 'put',
    path: config.path,
    summary: config.summary,
    ...(config.tags && { tags: config.tags }),
    request: {
      params: config.params,
      body: {
        content: {
          'application/json': { schema: config.requestSchema },
        },
      },
    },
    responses: {
      200: successResponse(config.responseSchema, 'Updated'),
      400: commonErrors[400],
      404: commonErrors[404],
    },
  });

const createDeleteRoute = <TParams extends z.ZodObject<any>>(config: {
  path: string;
  summary: string;
  params: TParams;
  tags?: string[];
}) =>
  createRoute({
    method: 'delete',
    path: config.path,
    summary: config.summary,
    ...(config.tags && { tags: config.tags }),
    request: {
      params: config.params,
    },
    responses: {
      200: successResponse(z.null(), 'Deleted'),
      404: commonErrors[404],
    },
  });

export { createGetRoute, createPostRoute, createPutRoute, createDeleteRoute };
