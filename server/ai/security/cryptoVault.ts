import crypto from 'crypto';
import { logger } from '../../utils/logger';

// 32-byte encryption key for AES-256-GCM
const ENCRYPTION_KEY_HEX = process.env.AI_ENCRYPTION_KEY || 'b68eb4f2e383e6678b37d128415bc4aca233e6d13ad536260acb1713a59de4fb';

function getEncryptionKey(): Buffer {
  if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== 64) {
    logger.warn('AI_ENCRYPTION_KEY is not a 64-char hex string. Using derived 32-byte buffer.');
    return crypto.createHash('sha256').update(ENCRYPTION_KEY_HEX || 'rf_fallback_key').digest();
  }
  return Buffer.from(ENCRYPTION_KEY_HEX, 'hex');
}

/**
 * Encrypts sensitive string (e.g. BYOK API key) using AES-256-GCM with authenticated tag.
 * Returns formatted string: iv:authTag:ciphertext (hex-encoded)
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted string.
 * Validates authentication tag to prevent tampering.
 */
export function decryptSecret(encryptedPayload: string): string {
  if (!encryptedPayload) return '';
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format. Expected iv:authTag:ciphertext');
  }

  const [ivHex, authTagHex, cipherTextHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(cipherTextHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Masks an API key for safe client presentation.
 * Example: 'sk-ant-api03-abcdef1234567890' -> 'sk-ant-...7890'
 */
export function maskApiKey(rawKey: string): string {
  if (!rawKey) return '';
  const trimmed = rawKey.trim();
  if (trimmed.length <= 8) {
    return '••••••••';
  }

  // Preserve standard provider prefixes
  let prefixLength = 7;
  if (trimmed.startsWith('sk-proj-')) prefixLength = 8;
  if (trimmed.startsWith('sk-ant-')) prefixLength = 7;
  if (trimmed.startsWith('sk-or-v1-')) prefixLength = 9;

  const prefix = trimmed.slice(0, prefixLength);
  const suffix = trimmed.slice(-4);
  return `${prefix}...${suffix}`;
}
