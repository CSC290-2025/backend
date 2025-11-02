import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.FILE_UPLOAD_DIR || './uploads';

export async function uploadFile(file: File): Promise<string> {
  await ensureDir(UPLOAD_DIR);

  const ext = file.name.split('.').pop();
  const filename = `${uuidv4()}.${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

async function ensureDir(dir: string) {
  const { mkdir } = await import('fs/promises');
  try {
    await mkdir(dir, { recursive: true });
  } catch (_error) {}
}
