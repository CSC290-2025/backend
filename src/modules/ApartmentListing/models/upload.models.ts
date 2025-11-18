import { deleteUploadFile, uploadFile } from '@/utils/upload';
import prisma from '@/config/client';
import { handlePrismaError } from '@/errors/prisma';

// export async function getPictureByUrl(fileUrl: string) {
//   try {
//     const upload = await prisma.apartment_picture.findFirst({
//       where: { file_path: fileUrl },
//     });
//     return upload;
//   } catch (error) {
//     throw handlePrismaError(error);
//   }
// }
export async function getPictureById(id: number) {
  try {
    const upload = await prisma.apartment_picture.findUnique({
      where: { id },
    });
    return upload;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function getPicturesByApartmentId(apartmentId: number) {
  try {
    const uploads = await prisma.apartment_picture.findMany({
      where: { apartment_id: apartmentId },
    });
    return uploads;
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function uploadPicture(file: File, apartmentId: number) {
  try {
    const uploadResult = await uploadFile({ file }, 9);
    const apartment = await prisma.apartment.findUnique({
      where: { id: Number(apartmentId) },
    });
    if (!apartment) {
      throw new Error('Apartment not found');
    }
    const pictureUrl = await prisma.apartment_picture.create({
      data: {
        name: uploadResult.id,
        file_path: uploadResult.url,
        apartment: {
          connect: { id: apartment.id },
        },
      },
    });
    return {
      ...pictureUrl,
      uploadId: uploadResult.id,
      url: uploadResult.url,
    };
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function deletePicture(fileId: string) {
  try {
    await deleteUploadFile(fileId);
    await prisma.apartment_picture.deleteMany({
      where: {
        name: fileId,
      },
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}
