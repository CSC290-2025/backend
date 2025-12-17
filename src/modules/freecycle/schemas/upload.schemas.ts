import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';

const UploadResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    url: z.string(),
  }),
});

const UploadBodySchema = z.object({
  file: z.any().openapi({
    type: 'string',
    format: 'binary',
    description: 'Select an image file to upload',
  }),
});

const uploadFileRoute = createRoute({
  method: 'post',
  path: '/upload',
  tags: ['Freecycle-Upload'],
  summary: 'Upload file',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: UploadBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: UploadResponseSchema,
        },
      },
      description: 'Upload successful',
    },
    400: {
      description: 'Invalid input',
    },
  },
});

const deleteFileRoute = createRoute({
  method: 'delete',
  path: '/upload/{id}',
  tags: ['Upload'],
  summary: 'Delete file',
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'cmhildd5x003n01o1ay66dwog' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'File deleted successfully',
    },
  },
});

export const UploadSchemas = {
  uploadFileRoute,
  deleteFileRoute,
};
