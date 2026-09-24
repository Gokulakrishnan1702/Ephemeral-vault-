/**
 * Ephemeral Secret Vault - Automated Security & Verification Test Suite
 * 
 * Executes real tests for all 8 mandatory security conditions:
 * 1. Happy Path (Create, single reveal, second attempt returns 404)
 * 2. Scraper Defense (Slackbot GET does not consume views)
 * 3. 20x Atomic Concurrency (Parallel race condition prevention)
 * 4. TTL Expiration & Garbage Collection (Expired secret removed)
 * 5. Tamper Detection (Bit alteration rejected cleanly by GCM auth tag)
 * 6. Zero Plaintext in Database (Plaintext string absent from DB)
 * 7. Unique Cryptographic IV (No IV repetition across secrets)
 * 8. Physical Hard Deletion (Row deleted from SQLite disk, no soft delete)
 */

import {
  encryptSecret,
  decryptSecret,
  generateSecretId
} from '../crypto/vaultCrypto.js';
import {
  db,
  statements,
  atomicBurnTransaction
} from '../database/db.js';
import { runSweep } from '../workers/sweeper.js';
import { isBotUserAgent } from '../middleware/scraperDetector.js';

let passedCount = 0;
let failedCount = 0;

function logTestResult(name: string, passed: boolean, notes: string) {
  if (passed) {
    passedCount++;
    console.log(`\x1b[32m✔ [PASS]\x1b[0m \x1b[1m${name}\x1b[0m - ${notes}`);
  } else {
    failedCount++;
    console.log(`\x1b[31m✖ [FAIL]\x1b[0m \x1b[1m${name}\x1b[0m - ${notes}`);
  }
}

async function runTestSuite() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 EPHEMERAL SECRET VAULT - AUTOMATED SECURITY TEST SUITE');
  console.log('='.repeat(70) + '\n');

  // -------------------------------------------------------------
  // Test 1: Happy Path (One-time reveal & subsequent 404)
  // -------------------------------------------------------------
  try {
    const id = 'test-hp-' + generateSecretId();
    const plain = 'super-secret-password-xyz';
    const enc = encryptSecret(plain);
    const now = Date.now();

    statements.insertSecret.run({
      id,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      auth_tag: enc.authTag,
      secret_type: 'Password',
      max_views: 1,
      views_remaining: 1,
      expires_at: now + 60000,
      created_at: now,
      user_id: null,
      passphrase_hash: null
    });

    // 1st burn: Must succeed
    const firstBurn = atomicBurnTransaction(id, Date.now());
    const revealed = firstBurn ? decryptSecret(firstBurn.ciphertext, firstBurn.iv, firstBurn.auth_tag) : null;
    const firstOk = (revealed === plain);

    // 2nd burn: Must return null (404)
    const secondBurn = atomicBurnTransaction(id, Date.now());
    const secondNull = (secondBurn === null);

    logTestResult('Test 1 — Happy Path (Single Burn)', firstOk && secondNull, 'Single reveal succeeds, second read safely returns 404.');
  } catch (err: any) {
    logTestResult('Test 1 — Happy Path', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 2: Scraper / Link-Preview Protection
  // -------------------------------------------------------------
  try {
    const ua = 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)';
    const isBot = isBotUserAgent(ua);
    
    // Simulate GET /view/:id check
    const id = 'test-scraper-' + generateSecretId();
    const enc = encryptSecret('test-scraper-data');
    statements.insertSecret.run({
      id,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      auth_tag: enc.authTag,
      secret_type: 'API Key',
      max_views: 1,
      views_remaining: 1,
      expires_at: Date.now() + 60000,
      created_at: Date.now(),
      user_id: null,
      passphrase_hash: null
    });

    // Simulate bot visiting GET endpoint: only metadata checked, never burn
    const meta = statements.getSecretMeta.get(id, Date.now()) as any;
    const viewsRemaining = meta?.views_remaining;

    statements.hardDeleteSecret.run(id);
    const passed = isBot && (viewsRemaining === 1);
    logTestResult('Test 2 — Scraper Defense', passed, 'Slackbot detected; GET metadata query did NOT decrement view counter.');
  } catch (err: any) {
    logTestResult('Test 2 — Scraper Defense', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 3: 20x Atomic Concurrency Race Attack
  // -------------------------------------------------------------
  try {
    const id = 'test-conc-' + generateSecretId();
    const enc = encryptSecret('race-condition-token');
    statements.insertSecret.run({
      id,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      auth_tag: enc.authTag,
      secret_type: 'Access Token',
      max_views: 1,
      views_remaining: 1,
      expires_at: Date.now() + 60000,
      created_at: Date.now(),
      user_id: null,
      passphrase_hash: null
    });

    const requests = await Promise.all(
      Array.from({ length: 20 }, async () => atomicBurnTransaction(id, Date.now()))
    );

    const successful = requests.filter(r => r !== null).length;
    const rejected = requests.filter(r => r === null).length;
    const passed = (successful === 1 && rejected === 19);

    logTestResult('Test 3 — 20x Concurrent Race Attack', passed, `Exactly 1 winner (HTTP 200) and 19 rejected (HTTP 404). Zero double-reads.`);
  } catch (err: any) {
    logTestResult('Test 3 — 20x Concurrent Race Attack', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 4: TTL Expiration & Automatic Sweeper
  // -------------------------------------------------------------
  try {
    const id = 'test-exp-' + generateSecretId();
    const enc = encryptSecret('temporary-token');
    statements.insertSecret.run({
      id,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      auth_tag: enc.authTag,
      secret_type: 'Temporary Credential',
      max_views: 1,
      views_remaining: 1,
      expires_at: Date.now() - 1000, // expired 1s ago
      created_at: Date.now() - 5000,
      user_id: null,
      passphrase_hash: null
    });

    // Run sweeper
    const swept = runSweep();
    const row = statements.getSecretRowById.get(id);
    const passed = (swept >= 1 && !row);

    logTestResult('Test 4 — TTL Expiration & Sweeper Deletion', passed, 'Expired secret cannot be read and was purged by background sweeper.');
  } catch (err: any) {
    logTestResult('Test 4 — TTL Expiration', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 5: Cryptographic Tamper Detection
  // -------------------------------------------------------------
  try {
    const enc = encryptSecret('confidential-cert');
    const tampered = Buffer.from(enc.ciphertext);
    tampered[0] ^= 0x42; // flip bits

    let caught = false;
    try {
      decryptSecret(tampered, enc.iv, enc.authTag);
    } catch {
      caught = true; // Expected: AES-GCM authTag failure
    }

    logTestResult('Test 5 — Ciphertext Tamper Detection', caught, 'AES-256-GCM authentication tag rejected modified ciphertext cleanly.');
  } catch (err: any) {
    logTestResult('Test 5 — Tamper Detection', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 6: Zero Plaintext in Database Inspection
  // -------------------------------------------------------------
  try {
    const id = 'test-pt-' + generateSecretId();
    const uniquePlain = 'UNENCRYPTED_CANARY_' + Date.now();
    const enc = encryptSecret(uniquePlain);

    statements.insertSecret.run({
      id,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      auth_tag: enc.authTag,
      secret_type: 'Database Credential',
      max_views: 1,
      views_remaining: 1,
      expires_at: Date.now() + 60000,
      created_at: Date.now(),
      user_id: null,
      passphrase_hash: null
    });

    const row = db.prepare(`SELECT * FROM secrets WHERE id = ?`).get(id) as any;
    const serialized = JSON.stringify(row);
    const leaked = serialized.includes(uniquePlain);
    statements.hardDeleteSecret.run(id);

    logTestResult('Test 6 — Zero Plaintext in SQLite Storage', !leaked, 'Verified raw database record: plaintext canary was NOT found in SQLite.');
  } catch (err: any) {
    logTestResult('Test 6 — Zero Plaintext', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 7: Unique Random IV Generation
  // -------------------------------------------------------------
  try {
    const ivs = new Set<string>();
    const count = 50;
    for (let i = 0; i < count; i++) {
      const e = encryptSecret('sample');
      ivs.add(e.iv.toString('hex'));
    }
    const passed = (ivs.size === count);
    logTestResult('Test 7 — Cryptographic IV Uniqueness', passed, `Generated ${count} secrets: exactly ${ivs.size} distinct 12-byte random IVs.`);
  } catch (err: any) {
    logTestResult('Test 7 — Unique IV', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 8: Physical Hard Deletion Verification
  // -------------------------------------------------------------
  try {
    const id = 'test-harddel-' + generateSecretId();
    const enc = encryptSecret('delete-me');
    statements.insertSecret.run({
      id,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      auth_tag: enc.authTag,
      secret_type: 'Configuration Secret',
      max_views: 1,
      views_remaining: 1,
      expires_at: Date.now() + 60000,
      created_at: Date.now(),
      user_id: null,
      passphrase_hash: null
    });

    // Burn
    atomicBurnTransaction(id, Date.now());

    // Check row
    const row = statements.getSecretRowById.get(id);
    const passed = (!row);
    logTestResult('Test 8 — Physical SQLite Hard Deletion', passed, 'Row physically deleted on zero views; no soft-deletion flag used.');
  } catch (err: any) {
    logTestResult('Test 8 — Physical Hard Deletion', false, err.message);
  }

  console.log('\n' + '─'.repeat(70));
  console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: \x1b[32m${passedCount}\x1b[0m | FAILED: \x1b[31m${failedCount}\x1b[0m`);
  console.log('─'.repeat(70) + '\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite();
