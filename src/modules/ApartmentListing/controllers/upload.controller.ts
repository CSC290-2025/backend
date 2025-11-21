import { successResponse } from '@/utils/response';
import { ValidationError, InternalServerError, NotFoundError } from '@/errors';
import type { Context } from 'hono';
import { uploadModel } from '../models/index';

async function getPictureByIdController(c: Context) {
  const id = Number(c.req.param('id'));
  const picture = await uploadModel.getPictureById(id);
  if (!picture) {
    throw new NotFoundError('Picture not found.');
  }
  return successResponse(c, {
    id: picture.id.toString(),
    url: picture.file_path,
    apartmentId: picture.apartment_id,
  });
}

async function getPicturesByApartmentIdController(c: Context) {
  const apartmentId = Number(c.req.param('apartmentId'));
  const pictures = await uploadModel.getPicturesByApartmentId(apartmentId);
  return successResponse(
    c,
    pictures.map((picture) => ({
      id: picture.id.toString(),
      fileId: picture.name,
      url: picture.file_path,
      apartmentId: picture.apartment_id,
    }))
  );
}

async function uploadFileController(c: Context) {
  const apartmentId = c.req.param('apartmentId');
  const body = await c.req.parseBody();
  const file = body['file'];

  // Check file
  if (!file || !(file instanceof File)) {
    throw new ValidationError('No valid file provided.');
  }

  try {
    const pictureResult = await uploadModel.uploadPicture(
      file,
      Number(apartmentId)
    );
    return successResponse(
      c,
      {
        id: pictureResult.id.toString(),
        url: pictureResult.file_path,
        apartmentId: Number(apartmentId),
      },
      200,
      'File uploaded successfully!'
    );
  } catch (err) {
    console.error(err);
    throw new InternalServerError('Upload failed.');
  }
}

async function deleteFileController(c: Context) {
  const { fileId } = c.req.param();

  if (!fileId) {
    throw new ValidationError('No valid file ID provided.');
  }

  try {
    await uploadModel.deletePicture(fileId);
    return successResponse(c, { message: 'File deleted successfully' }, 200);
  } catch (err) {
    console.error(err);
    throw new InternalServerError('Delete failed.');
  }
}
export {
  uploadFileController,
  deleteFileController,
  getPictureByIdController,
  getPicturesByApartmentIdController,
};
