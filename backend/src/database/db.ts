/**
 * Ephemeral Secret Vault - SQLite Database Layer
 * 
 * Configured with:
 * - WAL (Write-Ahead Logging) mode for concurrent read/write throughput
 * - Atomic transactions for burn-and-destroy race condition prevention
 * - Real hard deletion (no soft deletion / is_deleted flags)
 * - Prepared statements to prevent SQL injection vulnerabilities
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/vault.db';

// Ensure parent directory exists
const dbDir = path.dirname(path.resolve(dbPath));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath, {
  // verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
});

// Configure SQLite for high performance and durability
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS secrets (
    id TEXT PRIMARY KEY,
    ciphertext BLOB NOT NULL,
    iv BLOB NOT NULL,
    auth_tag BLOB NOT NULL,
    secret_type TEXT NOT NULL DEFAULT 'Custom Secret',
    max_views INTEGER NOT NULL DEFAULT 1,
    views_remaining INTEGER NOT NULL DEFAULT 1,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    user_id TEXT,
    passphrase_hash TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_secrets_expiry ON secrets(expires_at);

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_hash TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS system_counters (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0
  );
`);

// Initialize default system counters if not present
const initCounter = db.prepare(`
  INSERT OR IGNORE INTO system_counters (key, value) VALUES (?, 0)
`);
initCounter.run('total_secrets_created');
initCounter.run('total_secrets_destroyed');
initCounter.run('total_secrets_expired');
initCounter.run('total_reveals');
initCounter.run('blocked_crawlers');

/**
 * Increment a system counter
 */
export function incrementCounter(key: string, amount: number = 1): void {
  db.prepare(`
    UPDATE system_counters SET value = value + ? WHERE key = ?
  `).run(amount, key);
}

/**
 * Get all system metrics
 */
export function getSystemCounters(): Record<string, number> {
  const rows = db.prepare(`SELECT key, value FROM system_counters`).all() as { key: string; value: number }[];
  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

/**
 * Log an audit event (without logging plaintext secret or master key!)
 */
export function logAuditEvent(eventType: string, details: string, ipHash?: string): void {
  try {
    db.prepare(`
      INSERT INTO audit_events (event_type, details, ip_hash, created_at)
      VALUES (?, ?, ?, ?)
    `).run(eventType, details, ipHash || 'internal', Date.now());
  } catch (e) {
    console.error('[AUDIT] Failed to log audit event:', e);
  }
}

export interface SecretRecord {
  id: string;
  ciphertext: Buffer;
  iv: Buffer;
  auth_tag: Buffer;
  secret_type: string;
  max_views: number;
  views_remaining: number;
  expires_at: number;
  created_at: number;
  user_id?: string | null;
  passphrase_hash?: string | null;
}

/**
 * Prepared statements for high performance & SQL injection safety
 */
export const statements = {
  insertSecret: db.prepare(`
    INSERT INTO secrets (
      id, ciphertext, iv, auth_tag, secret_type,
      max_views, views_remaining, expires_at, created_at, user_id, passphrase_hash
    ) VALUES (
      @id, @ciphertext, @iv, @auth_tag, @secret_type,
      @max_views, @views_remaining, @expires_at, @created_at, @user_id, @passphrase_hash
    )
  `),

  getSecretMeta: db.prepare(`
    SELECT id, secret_type, max_views, views_remaining, expires_at, created_at,
           (passphrase_hash IS NOT NULL) AS has_passphrase
    FROM secrets
    WHERE id = ? AND expires_at > ? AND views_remaining > 0
  `),

  getSecretRowById: db.prepare(`
    SELECT * FROM secrets WHERE id = ?
  `),

  getUserSecretsMeta: db.prepare(`
    SELECT id, secret_type, max_views, views_remaining, expires_at, created_at
    FROM secrets
    WHERE user_id = ?
    ORDER BY created_at DESC
  `),

  getAllSecretsMeta: db.prepare(`
    SELECT id, secret_type, max_views, views_remaining, expires_at, created_at
    FROM secrets
    ORDER BY created_at DESC
    LIMIT 100
  `),

  hardDeleteSecret: db.prepare(`
    DELETE FROM secrets WHERE id = ?
  `),

  deleteExpiredSecrets: db.prepare(`
    DELETE FROM secrets WHERE expires_at <= ?
  `),

  countActiveSecrets: db.prepare(`
    SELECT COUNT(*) as count FROM secrets WHERE expires_at > ? AND views_remaining > 0
  `),

  getDbInspectorRows: db.prepare(`
    SELECT id, hex(ciphertext) as ciphertext_hex, hex(iv) as iv_hex, hex(auth_tag) as auth_tag_hex,
           secret_type, max_views, views_remaining, expires_at, created_at
    FROM secrets
    ORDER BY created_at DESC
    LIMIT 25
  `),

  // User auth statements
  findUserByEmail: db.prepare(`
    SELECT * FROM users WHERE email = ?
  `),

  findUserById: db.prepare(`
    SELECT id, name, email, created_at FROM users WHERE id = ?
  `),

  insertUser: db.prepare(`
    INSERT INTO users (id, name, email, password_hash, created_at)
    VALUES (@id, @name, @email, @password_hash, @created_at)
  `),
};

/**
 * ATOMIC BURN TRANSACTION:
 * Guarantees that even under heavy concurrent load (e.g., 20 simultaneous requests):
 * 1. A write transaction is acquired.
 * 2. Row is fetched and validated (views_remaining > 0 and expires_at > now).
 * 3. Views are decremented atomically.
 * 4. If remaining views reach 0, the row is PHYSICALLY HARD DELETED immediately.
 * 5. Returns the secret cipher data for decryption ONLY to the winning request.
 * 6. All other concurrent requests receive null, resulting cleanly in HTTP 404.
 */
export const atomicBurnTransaction = db.transaction((id: string, now: number): SecretRecord | null => {
  const row = db.prepare(`
    SELECT * FROM secrets 
    WHERE id = ? AND views_remaining > 0 AND expires_at > ?
  `).get(id, now) as SecretRecord | undefined;

  if (!row) {
    return null;
  }

  const remaining = row.views_remaining - 1;

  if (remaining <= 0) {
    // Permanent Hard Deletion from SQLite disk
    db.prepare(`DELETE FROM secrets WHERE id = ?`).run(id);
    incrementCounter('total_secrets_destroyed', 1);
  } else {
    db.prepare(`UPDATE secrets SET views_remaining = ? WHERE id = ?`).run(remaining, id);
  }

  incrementCounter('total_reveals', 1);

  return {
    ...row,
    views_remaining: remaining
  };
});
