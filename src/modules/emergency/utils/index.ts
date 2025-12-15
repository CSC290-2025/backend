export function base64ToBlobFromDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid Base64 data URL');
  }

  const mime = match[1];
  const base64 = match[2];

  const buffer = Buffer.from(base64, 'base64');

  const blob = new Blob([buffer], { type: mime });

  return blob;
}
