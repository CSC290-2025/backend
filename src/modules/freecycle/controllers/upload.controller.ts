import type { Context } from 'hono';
import { UploadService } from '../services/upload.service';
import { ValidationError } from '@/errors';

const uploadFile = async (c: Context) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || !(file instanceof File)) {
    throw new ValidationError('Invalid file format. Please upload a file.');
  }
  const result = await UploadService.uploadImage(file);
  return c.json(
    {
      message: 'File uploaded successfully',
      id: result.id,
      url: result.url,
    },
    201
  );
};

const deleteFile = async (c: Context) => {
  const id = c.req.param('id');

  if (!id) {
    throw new ValidationError('File ID is required');
  }
  await UploadService.deleteImage(id);
  return c.json(
    {
      message: 'File deleted successfully',
    },
    200
  );
};

export const UploadController = {
  uploadFile,
  deleteFile,
};
