import {
  createDeleteRoute,
  createGetRoute,
  createPostRoute,
} from '@/utils/openapi-helpers';
import { z } from 'zod';
import { fi } from 'zod/v4/locales';

// Data schema for upload response
const uploadDataSchema = z.object({
  id: z.string(),
  url: z.string(),
  apartmentId: z.number(),
});
// OpenAPI route

const getPictureById = createGetRoute({
  path: '/upload/{id}',
  summary: 'Get a picture by ID',
  params: z.object({
    id: z.coerce.number().openapi({}),
  }),
  responseSchema: uploadDataSchema,
  tags: ['upload'],
});

const getPicturesByApartmentId = createGetRoute({
  path: '/upload/apartment/{apartmentId}',
  summary: 'Get all pictures by apartment ID',
  params: z.object({
    apartmentId: z.coerce.number().openapi({}),
  }),
  responseSchema: z.array(uploadDataSchema),
  tags: ['upload'],
});

const uploadFileRoute = createPostRoute({
  path: '/upload/{apartmentId}',
  summary: 'Upload a file',
  params: z.object({
    apartmentId: z.coerce.number(),
  }),
  requestSchema: z.object({
    file: z.instanceof(File).openapi({
      type: 'string',
      format: 'binary',
      description: 'The file to upload',
    }),
  }),
  responseSchema: uploadDataSchema,
  tags: ['upload'],
});

const deleteFileRoute = createDeleteRoute({
  path: '/delete/{fileId}',
  summary: 'Delete a file',
  params: z.object({
    fileId: z.string().openapi({}),
  }),
  tags: ['upload'],
});

// Override the route to handle multipart/form-data
const uploadFileRouteWithMultipart = {
  ...uploadFileRoute,
  request: {
    ...uploadFileRoute.request,
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.instanceof(File).openapi({
              type: 'string',
              format: 'binary',
              description: 'The file to upload',
            }),
          }),
        },
      },
    },
  },
};

export const uploadSchemas = {
  uploadDataSchema,
  uploadFileRoute: uploadFileRouteWithMultipart,
  deleteFileRoute,
  getPicturesByApartmentId,
  getPictureById,
};
