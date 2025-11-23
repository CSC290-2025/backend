import { successResponse } from '@/utils/response';
import { ValidationError, InternalServerError } from '@/errors';
import type { Context } from 'hono';
import { UploadModel } from '../models';

async function uploadGeneralFileController(c: Context) {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || !(file instanceof File)) {
    throw new ValidationError('No valid file provided.');
  }

  try {
    const result = await UploadModel.uploadGeneralFile(file);
    return successResponse(c, result, 200, 'File uploaded successfully');
  } catch (err) {
    console.error(err);
    throw new InternalServerError('Upload failed.');
  }
}

async function deleteGeneralFileController(c: Context) {
  const fileId = c.req.param('id');
  if (!fileId) {
    throw new ValidationError('File ID is required.');
  }

  try {
    await UploadModel.deleteGeneralFile(fileId);
    return successResponse(
      c,
      { message: 'File deleted' },
      200,
      'File deleted successfully'
    );
  } catch (err) {
    console.error(err);
    throw new InternalServerError('Delete failed.');
  }
}

export { uploadGeneralFileController, deleteGeneralFileController };
