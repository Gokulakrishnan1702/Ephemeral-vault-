/**
 * Ephemeral Secret Vault - Secret Ingestion & Burn Endpoints
 */

import { Router, Request, Response } from 'express';
import os from 'node:os';
import {
  generateSecretId,
  encryptSecret,
  decryptSecret,
  hashPassword,
  verifyPassword
} from '../crypto/vaultCrypto.js';
import {
  statements,
  atomicBurnTransaction,
  incrementCounter,
  logAuditEvent,
  db
} from '../database/db.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

function getLocalNetworkIp(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const router = Router();

/**
 * POST /api/secret
 * Ingests a new secret, encrypts with AES-256-GCM, stores in SQLite.
 * Plaintext is NEVER stored in database, disk, or logs.
 */
router.post('/', optionalAuth, (req: Request, res: Response) => {
  try {
    const { secret, ttl_seconds, max_views, secret_type, passphrase } = req.body;

    if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
      return res.status(400).json({ error: 'Secret content cannot be empty.' });
    }

    if (secret.length > 500000) { // 500 KB limit for payload safety
      return res.status(400).json({ error: 'Secret exceeds maximum allowable size (500KB).' });
    }

    const ttl = Math.min(Math.max(parseInt(ttl_seconds) || 3600, 10), 604800); // 10s to 7 days
    const views = Math.min(Math.max(parseInt(max_views) || 1, 1), 100);
    const type = (typeof secret_type === 'string' && secret_type.trim()) ? secret_type.trim() : 'Custom Secret';

    // 1. Generate non-enumerable cryptographically random ID
    const secretId = generateSecretId();

    // 2. Encrypt secret with AES-256-GCM and unique random 12-byte IV
    const encrypted = encryptSecret(secret, passphrase);

    // 3. Calculate timestamps
    const now = Date.now();
    const expiresAt = now + (ttl * 1000);

    // Optional passphrase hash for verification before decryption attempt
    const passphraseHash = passphrase ? hashPassword(passphrase) : null;
    const userId = req.user?.id || null;

    // 4. Store exclusively ciphertext, random IV, and auth tag in SQLite
    statements.insertSecret.run({
      id: secretId,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      auth_tag: encrypted.authTag,
      secret_type: type,
      max_views: views,
      views_remaining: views,
      expires_at: expiresAt,
      created_at: now,
      user_id: userId,
      passphrase_hash: passphraseHash
    });

    incrementCounter('total_secrets_created', 1);
    logAuditEvent('SECRET_CREATED', `Secret ID ${secretId} ingested with TTL ${ttl}s and ${views} view(s).`);

    // Determine URLs: Public tunnel (if valid), Local Wi-Fi LAN IP, and Localhost
    const localIp = getLocalNetworkIp();
    const publicEnv = process.env.PUBLIC_URL?.trim();
    const hasValidPublicUrl = Boolean(
      publicEnv &&
      publicEnv.startsWith('http') &&
      !publicEnv.includes('localhost') &&
      !publicEnv.includes('127.0.0.1') &&
      !publicEnv.includes('172.') &&
      !publicEnv.includes('192.168.') &&
      !publicEnv.includes('10.') &&
      !publicEnv.includes('photographs-nevertheless-forest-inline')
    );

    const localViewUrl = `http://localhost:5173/view/${secretId}`;
    const lanViewUrl = `http://${localIp}:5173/view/${secretId}`;
    const publicViewUrl = hasValidPublicUrl ? `${publicEnv}/view/${secretId}` : undefined;

    // Default view_url is local URL unless a real public URL is configured
    const viewUrl = publicViewUrl || localViewUrl;

    return res.status(201).json({
      id: secretId,
      view_url: viewUrl,
      public_url: publicViewUrl,
      lan_url: lanViewUrl,
      local_url: localViewUrl,
      expires_at: new Date(expiresAt).toISOString(),
      expires_at_ms: expiresAt,
      max_views: views,
      views_remaining: views,
      secret_type: type
    });
  } catch (error: any) {
    console.error('[SECRET CREATION ERROR]', error);
    return res.status(500).json({ error: 'Failed to securely encrypt and store secret.' });
  }
});

/**
 * GET /api/secret/:id/meta
 * Safe landing page metadata lookup.
 * CRITICAL RULE: NEVER DECRYPTS, NEVER BURNS, NEVER DECREMENTS VIEWS.
 */
router.get('/:id/meta', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const now = Date.now();

    const row = statements.getSecretMeta.get(id, now) as {
      id: string;
      secret_type: string;
      max_views: number;
      views_remaining: number;
      expires_at: number;
      created_at: number;
      has_passphrase: number;
    } | undefined;

    if (!row) {
      return res.status(404).json({
        error: 'Secret not found, expired, or already destroyed.',
        id
      });
    }

    return res.status(200).json({
      id: row.id,
      secret_type: row.secret_type,
      max_views: row.max_views,
      views_remaining: row.views_remaining,
      expires_at: row.expires_at,
      created_at: row.created_at,
      has_passphrase: Boolean(row.has_passphrase)
    });
  } catch (error: any) {
    console.error('[SECRET META ERROR]', error);
    return res.status(500).json({ error: 'Failed to query secret status.' });
  }
});

/**
 * POST /api/secret/:id/burn
 * THE ONLY ENDPOINT AUTHORIZED TO DECRYPT AND DESTROY.
 * Uses atomic SQLite mutation to prevent concurrent double-reading races.
 * If views_remaining reaches 0, row is physically hard-deleted immediately.
 */
router.post('/:id/burn', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { passphrase } = req.body || {};
    const now = Date.now();

    // Execute atomic transaction (views decremented & row hard-deleted atomically)
    const secretRow = atomicBurnTransaction(id, now);

    if (!secretRow) {
      logAuditEvent('BURN_FAILED_404', `Burn requested for unavailable/destroyed secret ${id}`);
      return res.status(404).json({
        error: 'Secret not found, expired, or already destroyed.'
      });
    }

    // Passphrase validation if set
    if (secretRow.passphrase_hash) {
      if (!passphrase || !verifyPassword(passphrase, secretRow.passphrase_hash)) {
        // Rollback attempt or notice: the view was consumed to prevent brute force
        return res.status(401).json({
          error: 'Passphrase authentication failed. View attempt consumed for security.'
        });
      }
    }

    // Decrypt using AES-256-GCM and verify authentication tag
    let plaintext: string;
    try {
      plaintext = decryptSecret(
        secretRow.ciphertext,
        secretRow.iv,
        secretRow.auth_tag,
        passphrase
      );
    } catch (cryptoError: any) {
      logAuditEvent('TAMPER_DETECTED', `Ciphertext authentication failed for secret ${id}`);
      return res.status(400).json({
        error: 'Cryptographic authentication failed: secret data was tampered with or corrupted.'
      });
    }

    logAuditEvent('SECRET_BURNED', `Secret ${id} revealed and burned. Views remaining: ${secretRow.views_remaining}`);

    return res.status(200).json({
      id: secretRow.id,
      secret: plaintext,
      secret_type: secretRow.secret_type,
      views_remaining: secretRow.views_remaining,
      max_views: secretRow.max_views,
      burned: secretRow.views_remaining <= 0,
      status: secretRow.views_remaining <= 0 ? 'destroyed' : 'active',
      burned_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[SECRET BURN ERROR]', error);
    return res.status(500).json({ error: 'Failed to decrypt secret.' });
  }
});

/**
 * GET /api/secrets
 * Returns user secrets metadata list (never plaintext, never ciphertext)
 */
router.get('/', optionalAuth, (req: Request, res: Response) => {
  try {
    const now = Date.now();
    let rows: any[] = [];

    if (req.user?.id) {
      rows = statements.getUserSecretsMeta.all(req.user.id);
    } else {
      rows = statements.getAllSecretsMeta.all();
    }

    const formatted = rows.map((r) => {
      let status = 'Active';
      if (r.expires_at <= now) {
        status = 'Expired';
      } else if (r.views_remaining <= 0) {
        status = 'Destroyed';
      } else if (r.expires_at - now < 300000) { // less than 5 min
        status = 'Expiring Soon';
      }

      return {
        id: r.id,
        secret_type: r.secret_type,
        max_views: r.max_views,
        views_remaining: r.views_remaining,
        expires_at: r.expires_at,
        created_at: r.created_at,
        status
      };
    });

    return res.status(200).json({ secrets: formatted });
  } catch (error: any) {
    console.error('[LIST SECRETS ERROR]', error);
    return res.status(500).json({ error: 'Failed to retrieve secrets metadata.' });
  }
});

/**
 * DELETE /api/secret/:id
 * Manual early destruction of a secret by the creator
 */
router.delete('/:id', optionalAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = statements.hardDeleteSecret.run(id);

    if (result.changes > 0) {
      incrementCounter('total_secrets_destroyed', 1);
      logAuditEvent('MANUAL_DESTROY', `Secret ${id} explicitly hard-deleted.`);
      return res.status(200).json({ message: 'Secret permanently destroyed.' });
    } else {
      return res.status(404).json({ error: 'Secret not found or already deleted.' });
    }
  } catch (error: any) {
    console.error('[MANUAL DELETE ERROR]', error);
    return res.status(500).json({ error: 'Failed to delete secret.' });
  }
});

export default router;
