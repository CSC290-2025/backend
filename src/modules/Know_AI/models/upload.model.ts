import { deleteUploadFile, uploadFile } from '@/utils/upload';
import { handlePrismaError } from '@/errors/prisma';

export async function uploadGeneralFile(file: File) {
  try {
    const result = await uploadFile({ file }, 1);
    return {
      id: result.id,
      url: result.url,
    };
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function deleteGeneralFile(fileId: string) {
  try {
    await deleteUploadFile(fileId);
    return true;
  } catch (error) {
    throw handlePrismaError(error);
  }
}
