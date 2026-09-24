/**
 * Ephemeral Secret Vault - Cryptographic Engine
 * 
 * Implements authenticated symmetric encryption using AES-256-GCM.
 * Security specifications:
 * - 256-bit (32-byte) master key loaded from VAULT_MASTER_KEY environment variable.
 * - Cryptographically random 12-byte (96-bit) IV generated per secret using crypto.randomBytes(12).
 * - 16-byte (128-bit) GCM authentication tag for tamper detection.
 * - Zero plaintext stored in memory longer than necessary; zero plaintext written to disk/logs.
 */

import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
dotenv.config(); // fallback

// Master key resolution
function getMasterKey(): Buffer {
  const envKey = process.env.VAULT_MASTER_KEY;
  if (!envKey) {
    throw new Error('[CRYPTO FATAL] VAULT_MASTER_KEY environment variable is not defined.');
  }

  // Support 64-char hex key or 44-char base64 key or derive 32-byte buffer
  let keyBuffer: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(envKey)) {
    keyBuffer = Buffer.from(envKey, 'hex');
  } else if (envKey.length === 44 && envKey.endsWith('=')) {
    keyBuffer = Buffer.from(envKey, 'base64');
  } else {
    // Deterministic SHA-256 derivation if user provided custom passphrase
    keyBuffer = crypto.createHash('sha256').update(envKey).digest();
  }

  if (keyBuffer.length !== 32) {
    throw new Error(`[CRYPTO FATAL] Master key length must be 32 bytes (256-bit). Received ${keyBuffer.length} bytes.`);
  }

  return keyBuffer;
}

export interface EncryptedPayload {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
}

/**
 * Generate a cryptographically random, non-enumerable secret ID
 */
export function generateSecretId(): string {
  // 12-character hex ID (48 bits of entropy) - URL-safe and non-enumerable
  return crypto.randomBytes(6).toString('hex');
}

/**
 * Encrypt plaintext using AES-256-GCM with a unique 12-byte random IV.
 * Optionally mixes with an additional client-provided passphrase.
 */
export function encryptSecret(plaintext: string, additionalPassphrase?: string): EncryptedPayload {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new Error('Secret plaintext cannot be empty.');
  }

  let masterKey = getMasterKey();

  // If a user passphrase is provided, derive a secondary key via PBKDF2
  let effectiveKey = masterKey;
  if (additionalPassphrase && additionalPassphrase.trim().length > 0) {
    const salt = crypto.createHash('sha256').update(masterKey).digest();
    effectiveKey = crypto.pbkdf2Sync(additionalPassphrase, salt, 100000, 32, 'sha256');
  }

  // 12-byte random IV (recommended size for GCM to prevent IV collision & avoid GHASH calculation)
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', effectiveKey, iv);
  
  const ciphertextBuffer = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertextBuffer,
    iv,
    authTag
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM.
 * Authenticates the ciphertext using the 16-byte authTag.
 * Throws clean error if ciphertext or authTag has been tampered with.
 */
export function decryptSecret(
  ciphertext: Buffer,
  iv: Buffer,
  authTag: Buffer,
  additionalPassphrase?: string
): string {
  let masterKey = getMasterKey();

  let effectiveKey = masterKey;
  if (additionalPassphrase && additionalPassphrase.trim().length > 0) {
    const salt = crypto.createHash('sha256').update(masterKey).digest();
    effectiveKey = crypto.pbkdf2Sync(additionalPassphrase, salt, 100000, 32, 'sha256');
  }

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', effectiveKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  } catch (error: any) {
    // In AES-GCM, any single bit alteration in ciphertext, IV, or authTag
    // will trigger an authentication failure (decipher.final() throws)
    throw new Error('Authentication failed: ciphertext has been tampered with or invalid key/passphrase.');
  }
}

/**
 * Secure password hashing for user accounts (PBKDF2 with 100,000 iterations)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}
