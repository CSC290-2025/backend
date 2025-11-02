import type { Context } from 'hono';
import { uploadApartmentPicture } from '../models/cloudinary.model';

export async function uploadApartmentPicController(c: Context) {
  const body = await c.req.parseBody();
  const file = body.image as File;
  if (!file) {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  try {
    const imageUrl = await uploadApartmentPicture(file);
    return c.json({ imageUrl });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
}
