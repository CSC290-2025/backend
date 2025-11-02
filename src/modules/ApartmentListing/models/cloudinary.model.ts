import cloudinary from '../utils/cloudinary';

export async function uploadApartmentPicture(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    public_id: `apartment-pic-${Date.now()}`,
  });
  return result.secure_url;
}
