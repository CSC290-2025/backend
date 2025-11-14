import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const KEY = Buffer.from(process.env.G11_CARD_ENC_KEY!, 'hex');

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const partToEncrypt = plaintext.slice(0, -4);
  const lastFour = plaintext.slice(-4);

  const cipher = crypto.createCipheriv(ALGO, KEY, iv, { authTagLength: 16 });

  const ciphertext = Buffer.concat([
    cipher.update(partToEncrypt, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  const encryptedBuffer = Buffer.concat([iv, tag, ciphertext]);
  const encryptedPart = encryptedBuffer.toString('base64');

  return encryptedPart + lastFour;
}

export function decrypt(encryptedText: string): string {
  const lastFour = encryptedText.slice(-4);
  const base64Part = encryptedText.slice(0, -4);

  const buffer = Buffer.from(base64Part, 'base64');
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const ciphertext = buffer.subarray(28);

  const decipher = crypto.createDecipheriv(ALGO, KEY, iv, {
    authTagLength: 16,
  });
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');

  return decrypted + lastFour;
}

export function maskCardNumber19(full: string) {
  const visible = full.slice(-4);

  const masked = '•••• •••• •••• ';

  return masked + visible;
}
