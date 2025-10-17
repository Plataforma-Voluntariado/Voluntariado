// src/verificacion/verificacion_archivo/helpers/aes.util.ts
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // bytes

function getSecretKey(userId: number): Buffer {
  const secret = process.env.AES_SECRET_KEY;
  if (!secret) throw new Error('La clave AES_SECRET_KEY no está definida en .env');
  return crypto.createHash('sha256').update(`${userId}-${secret}`).digest();
}

export function encriptarArchivo(buffer: Buffer, userId: number): Buffer {
  const key = getSecretKey(userId);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}

export function desencriptarArchivo(encryptedBuffer: Buffer, userId: number): Buffer {
  const key = getSecretKey(userId);
  const iv = encryptedBuffer.slice(0, IV_LENGTH);
  const data = encryptedBuffer.slice(IV_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}
