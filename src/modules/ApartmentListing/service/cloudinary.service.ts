import { cloudinaryModel } from '../models';

const uploadApartmentPicture = async (file: File): Promise<string> => {
  const picture = await cloudinaryModel.uploadApartmentPicture(file);
  if (!picture) {
    throw new Error('Failed to upload picture');
  }
  return picture;
};

export { uploadApartmentPicture };
