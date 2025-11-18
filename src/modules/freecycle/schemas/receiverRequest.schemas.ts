import { z } from 'zod';
import {
  createGetRoute,
  createPostRoute,
  createPutRoute,
  createDeleteRoute,
} from '@/utils/openapi-helpers';
import { AuthMiddleware } from '@/middlewares';

const RequestStatusEnum = z.enum(['pending', 'accepted', 'rejected']);

const ReceiverRequestSchema = z.object({
  id: z.number(),
  post_id: z.number().nullable(),
  receiver_id: z.number().nullable(),
  status: RequestStatusEnum,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const CreateReceiverRequestSchema = z.object({
  post_id: z.number(),
});

const UpdateReceiverRequestSchema = z.object({
  status: RequestStatusEnum,
});

const RequestIdParam = z.object({
  id: z.coerce.number(),
});

const PostIdParam = z.object({
  postId: z.coerce.number(),
});

const getAllRequestRoute = createGetRoute({
  path: '/requests',
  summary: 'Get all request',
  responseSchema: z.array(ReceiverRequestSchema),
  tags: ['Freecycle-ReceiverRequest'],
});

const getRequestByIdRoute = createGetRoute({
  path: '/requests/{id}',
  summary: 'Get request by id',
  responseSchema: ReceiverRequestSchema,
  params: RequestIdParam,
  tags: ['Freecycle-ReceiverRequest'],
  middleware: [AuthMiddleware.isUser],
});

const getUserRequestRoute = createGetRoute({
  path: '/requests/me',
  summary: 'Get my request',
  responseSchema: z.array(ReceiverRequestSchema),
  tags: ['Freecycle-ReceiverRequest'],
  middleware: [AuthMiddleware.isUser],
});

const getPostRequestRoute = createGetRoute({
  path: '/posts/{postId}/requests',
  summary: 'Get requests for post',
  responseSchema: z.array(ReceiverRequestSchema),
  params: PostIdParam,
  tags: ['Freecycle-ReceiverRequest'],
});

const createRequestRoute = createPostRoute({
  path: '/requests',
  summary: 'Create receiver request',
  requestSchema: CreateReceiverRequestSchema,
  responseSchema: ReceiverRequestSchema,
  tags: ['Freecycle-ReceiverRequest'],
  middleware: [AuthMiddleware.isUser],
});

const deleteRequestRoute = createDeleteRoute({
  path: '/requests/{id}',
  summary: 'Cancel receiver request',
  params: RequestIdParam,
  tags: ['Freecycle-ReceiverRequest'],
  middleware: [AuthMiddleware.isUser],
});

const updateRequestStatusRoute = createPutRoute({
  path: '/requests/{id}/status',
  summary: 'Update request status',
  requestSchema: UpdateReceiverRequestSchema,
  responseSchema: ReceiverRequestSchema,
  params: RequestIdParam,
  tags: ['Freecycle-ReceiverRequest'],
  middleware: [AuthMiddleware.isUser],
});

export const FreecycleReceiverRequestSchemas = {
  RequestStatusEnum,
  ReceiverRequestSchema,
  CreateReceiverRequestSchema,
  UpdateReceiverRequestSchema,
  RequestIdParam,
  PostIdParam,
  getAllRequestRoute,
  getRequestByIdRoute,
  getUserRequestRoute,
  getPostRequestRoute,
  createRequestRoute,
  deleteRequestRoute,
  updateRequestStatusRoute,
};
