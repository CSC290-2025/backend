import { z } from 'zod';
import { createDeleteRoute, createPostRoute } from '@/utils/openapi-helpers';

const uploadDataSchema = z.object({
  id: z.string(),
  url: z.string(),
});

const uploadDataRoute = createPostRoute({
  path: '/upload/data/file',
  summary: 'Upload a general file (Image/Video)',
  requestSchema: z.object({
    file: z.instanceof(File).openapi({
      type: 'string',
      format: 'binary',
      description: 'File content',
    }),
  }),
  responseSchema: uploadDataSchema,
  tags: ['upload'],
});

const uploadDataRouteWithMultipart = {
  ...uploadDataRoute,
  request: {
    ...uploadDataRoute.request,
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.instanceof(File).openapi({
              type: 'string',
              format: 'binary',
              description: 'File content',
            }),
          }),
        },
      },
    },
  },
};

const deleteDataRoute = createDeleteRoute({
  path: '/delete/data/file/{id}',
  summary: 'Delete a file from server by ID',
  params: z.object({
    id: z.string().openapi({ description: 'The Zipline File ID' }),
  }),
  tags: ['upload'],
});

export { uploadDataRouteWithMultipart as uploadDataRoute, deleteDataRoute };
