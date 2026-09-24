/**
 * Ephemeral Secret Vault - Background TTL Sweeper
 * 
 * Periodically executes hard deletion on expired secrets.
 * Ensures zero expired plaintext/ciphertext remains on disk.
 * Runs on a configurable interval (default: 15 seconds).
 */

import { db, statements, incrementCounter, logAuditEvent } from '../database/db.js';

let sweeperInterval: NodeJS.Timeout | null = null;
let isSweeping = false;
let totalSweptCount = 0;

/**
 * Sweep expired secrets from SQLite
 */
export function runSweep(): number {
  if (isSweeping) return 0;
  isSweeping = true;

  try {
    const now = Date.now();
    const result = statements.deleteExpiredSecrets.run(now);
    const count = result.changes;

    if (count > 0) {
      totalSweptCount += count;
      incrementCounter('total_secrets_expired', count);
      logAuditEvent('TTL_SWEEP_EXPIRED', `Sweeper hard-deleted ${count} expired secrets.`);
      console.log(`[Sweeper] Removed ${count} expired secret(s) at ${new Date(now).toISOString()}`);
    }

    return count;
  } catch (error) {
    console.error('[Sweeper Error] Failed to purge expired secrets:', error);
    return 0;
  } finally {
    isSweeping = false;
  }
}

/**
 * Start the background sweeper daemon
 */
export function startSweeper(intervalMs: number = 15000): void {
  if (sweeperInterval) {
    clearInterval(sweeperInterval);
  }

  console.log(`[Sweeper] TTL Garbage Collection Daemon started (Interval: ${intervalMs}ms)`);
  
  // Run an immediate sweep on boot
  runSweep();

  sweeperInterval = setInterval(() => {
    runSweep();
  }, intervalMs);
}

/**
 * Stop the background sweeper daemon
 */
export function stopSweeper(): void {
  if (sweeperInterval) {
    clearInterval(sweeperInterval);
    sweeperInterval = null;
    console.log('[Sweeper] TTL Garbage Collection Daemon stopped.');
  }
}

export function getSweeperStatus() {
  return {
    running: sweeperInterval !== null,
    totalPurged: totalSweptCount,
    lastRun: new Date().toISOString()
  };
}
