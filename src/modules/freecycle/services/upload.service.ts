import { deleteUploadFile, uploadFile } from '@/utils/upload';
import { ValidationError } from '@/errors';

const GROUP_ID = 4;

const uploadImage = async (file: File) => {
  if (!file) {
    throw new ValidationError('No file provided');
  }
  const result = await uploadFile({ file }, GROUP_ID);
  return result;
};

const deleteImage = async (fileId: string) => {
  if (!fileId) return;
  await deleteUploadFile(fileId);
};

export const UploadService = {
  uploadImage,
  deleteImage,
};
