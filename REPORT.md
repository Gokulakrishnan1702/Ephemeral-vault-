# 🛡️ Ephemeral Secret Vault — Engineering & Security Report

**System Name**: Ephemeral Secret Vault  
**Tagline**: SECRET INGESTION → ENCRYPTED VAULT → SAFE BURN  
**Architectural Paradigm**: Zero-Plaintext Ephemeral Cryptographic Storage  
**Primary Cryptographic Primitive**: AES-256-GCM with 96-Bit Random IV & 128-Bit Poly1305/GMAC  
**Database Engine**: SQLite 3 (WAL Mode, Parameterized Prepared Statements, Atomic Transactions)  

---

## 1. Architecture

The system follows a layered, defense-in-depth architecture designed to eliminate plaintext leakage across all states of data (in transit, in process, and at rest):

```
+-----------------------------------------------------------------------+
|                            CLIENT TIER                                |
|  - React 18 SPA (Vite + TypeScript + Tailwind CSS + Framer Motion)    |
|  - CLI Stdin Pipeline (vault-cli.js)                                  |
+-----------------------------------┬-----------------------------------+
                                    │ HTTPS / REST (JSON)
                                    ▼
+-----------------------------------------------------------------------+
|                         APPLICATION GATEWAY                           |
|  - Express 4.x Security Middleware                                    |
|  - Helmet Security Headers (CSP, FrameGuard, NoSniff, ReferrerPolicy) |
|  - Request Correlation ID (X-Request-ID)                              |
|  - Scraper / Bot Defense Engine (Slackbot, Discordbot, Facebook)     |
|  - Rate Limiter & Strict Schema Sanitizer                             |
+-----------------------------------┬-----------------------------------+
                                    │
                                    ▼
+-----------------------------------------------------------------------+
|                        CRYPTOGRAPHIC ENGINE                           |
|  - 256-Bit Master Key (VAULT_MASTER_KEY from Process Environment)    |
|  - Node.js Hardware-Accelerated crypto Subsystem                      |
|  - 12-Byte Cryptographically Random IV per Secret                    |
|  - 16-Byte Galois Authentication Tag for Tamper Proofing              |
+-----------------------------------┬-----------------------------------+
                                    │ Ciphertext, IV, AuthTag BLOBs
                                    ▼
+-----------------------------------------------------------------------+
|                        STORAGE ENGINE (SQLITE)                        |
|  - Write-Ahead Logging (WAL) Mode for High Concurrency                |
|  - Atomic Transactions for Burn Decrementation                        |
|  - Prepared Statements (Zero SQL Concatenation)                       |
|  - Hard Deletion on View Exhaustion (Zero Soft Deletion Flags)        |
+-----------------------------------┬-----------------------------------+
                                    ▲
                                    │ Sweeps Expired Rows
+-----------------------------------┴-----------------------------------+
|                      BACKGROUND SWEEPER WORKER                        |
|  - Scheduled Interval Daemon (15,000ms)                               |
|  - Atomic Purge: DELETE FROM secrets WHERE expires_at <= ?            |
|  - Sanitized Audit Logging (Never logs plaintext)                     |
+-----------------------------------------------------------------------+
```

---

## 2. Security / Threat Model

The vault's security posture is designed against standard and advanced threat vectors:

| Threat Vector | Potential Impact | Vault Defense Mechanism |
|---|---|---|
| **Database Compromise / Offline Disk Inspection** | Attacker obtains SQLite database file. | Master key is loaded strictly from environment memory. Only ciphertext, IV, and auth tag exist in SQLite. Zero plaintext recovery is possible without the master key. |
| **Link Unfurling / Chat Bot Crawler Preview** | Messaging client bot opens link and prematurely burns secret. | `GET /view/:id` is strictly read-only and serves metadata only. Bot User-Agents receive safe OpenGraph previews. |
| **Concurrent Race Condition Double-Reading** | Multiple recipients or automated bots open one-view secret simultaneously. | SQLite transaction write locks serialize burn requests. Exactly one request updates views and decrypts; all others receive HTTP 404. |
| **Ciphertext Bit Flipping / Tampering** | Attacker alters ciphertext bytes in database or transit. | AES-GCM 16-byte authentication tag verifies message integrity during `decipher.final()`. Any bit modification fails cleanly with zero plaintext leakage. |
| **Long-Term Memory / Disk Residue** | Expired secrets remain accessible or unpurged. | Background TTL sweeper worker runs hard-deletion every 15 seconds. Frontend state is cleared upon component unmount. |
| **SQL Injection** | SQL query manipulation via user input. | 100% prepared parameterized statements via `better-sqlite3`. No dynamic string concatenation. |

---

## 3. Scraper Protection

When links are shared on Slack, Discord, WhatsApp, or Twitter, their servers automatically execute an HTTP `GET` request to unfurl OpenGraph preview metadata (title, image, description).

### Flaw in Traditional Implementations
Many self-destructing link tools burn the secret on `GET /secret/:id`, which causes the link preview bot to consume the secret before the intended human recipient ever opens the message.

### Vault Solution
1. **Separation of Metadata and Consumption**:
   - `GET /view/:id` and `GET /api/secret/:id/meta` are idempotent and read-only.
   - Decryption and burning are restricted exclusively to `POST /api/secret/:id/burn`.
2. **User-Agent Classifier**:
   - The `scraperProtectionMiddleware` inspects `req.headers['user-agent']`.
   - Known bots (`slackbot`, `discordbot`, `facebookexternalhit`, `whatsapp`, `twitterbot`, `spider`, `crawl`, `preview`) receive safe metadata without triggering view counter mutations.

---

## 4. Concurrency Strategy

To guarantee that a 1-view secret cannot be read simultaneously by two concurrent threads:

```typescript
export const atomicBurnTransaction = db.transaction((id: string, now: number): SecretRecord | null => {
  const row = db.prepare(`
    SELECT * FROM secrets 
    WHERE id = ? AND views_remaining > 0 AND expires_at > ?
  `).get(id, now) as SecretRecord | undefined;

  if (!row) {
    return null; // Losing requests exit immediately
  }

  const remaining = row.views_remaining - 1;

  if (remaining <= 0) {
    // Physical Hard Deletion
    db.prepare(`DELETE FROM secrets WHERE id = ?`).run(id);
  } else {
    db.prepare(`UPDATE secrets SET views_remaining = ? WHERE id = ?`).run(remaining, id);
  }

  return { ...row, views_remaining: remaining };
});
```

Because `better-sqlite3` transactions acquire SQLite's RESERVED lock synchronously, parallel requests are queued sequentially. The winning transaction updates/deletes the record. All subsequent transactions within the same millisecond observe `views_remaining = 0` or missing rows, returning `null` (HTTP 404).

---

## 5. Cryptographic Design

- **Cipher**: Advanced Encryption Standard in Galois/Counter Mode (AES-256-GCM).
- **Key Derivation**: 256-bit key from `VAULT_MASTER_KEY`. Optional secondary passphrases use PBKDF2 (100,000 iterations of SHA-256).
- **IV Specifications**: 12-byte (96-bit) cryptographically random IV generated per secret using `crypto.randomBytes(12)`.
- **Integrity Tag**: 16-byte (128-bit) GMAC tag extracted via `cipher.getAuthTag()` and authenticated via `decipher.setAuthTag()`.

---

## 6. Database Design

```sql
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
```

### Invariants Enforced:
- SQLite WAL mode enabled: `PRAGMA journal_mode = WAL;`
- Synchronous mode NORMAL: `PRAGMA synchronous = NORMAL;`
- No `is_deleted` column. Deletions are real SQL `DELETE` operations.

---

## 7. TTL Garbage Collection

Unrevealed secrets that expire must not persist on disk indefinitely.

- The sweeper worker runs every 15,000 milliseconds.
- Query: `DELETE FROM secrets WHERE expires_at <= ?`.
- Uses prepared statement `statements.deleteExpiredSecrets`.
- Telemetry: Sweeper increments `total_secrets_expired` and logs audit events without logging secret data.

---

## 8. Testing Results & Benchmark Table

### Summary Table (Part 9 Section 5 Requirement):

| Test Scenario | Input / Execution | Expected Behavior | Actual Result | Status |
|---|---|---|---|:---:|
| **Happy Path (1-View Burn)** | Created secret with 1 view; read once via `POST /burn`, then re-queried | First read: HTTP 200 with decrypted plaintext. Second read: HTTP 404 | 1st read decrypted successfully; 2nd read returned HTTP 404 | **PASS** |
| **Simultaneous Race Condition (20 Parallel Calls)** | 20 concurrent HTTP burn requests fired at the exact same millisecond against a 1-view secret | Exactly 1 request receives HTTP 200; 19 requests receive HTTP 404 | Exactly 1 winner (HTTP 200); 19 rejected (HTTP 404). Zero double-reads. | **PASS** |
| **TTL Expiration Cleanup** | Secret with 1s TTL allowed to elapse; background sweeper executed | Secret unreadable after expiration; database row completely wiped | Decryption blocked; sweeper hard-deleted row from SQLite | **PASS** |
| **Invalid / Tampered Cipher Payload** | Modified 1 byte of ciphertext directly in SQLite | AES-256-GCM authentication fails cleanly; 0 corrupted plaintext leaked | GCM Poly1305/GMAC tag failed cleanly; returned HTTP 400 safe error | **PASS** |

### Automated Test Runner Execution Output:

```text
======================================================================
🧪 EPHEMERAL SECRET VAULT - AUTOMATED SECURITY TEST SUITE
======================================================================

✔ [PASS] Test 1 — Happy Path (Single Burn) - Single reveal succeeds, second read safely returns 404.
✔ [PASS] Test 2 — Scraper Defense - Slackbot detected; GET metadata query did NOT decrement view counter.
✔ [PASS] Test 3 — 20x Concurrent Race Attack - Exactly 1 winner (HTTP 200) and 19 rejected (HTTP 404). Zero double-reads.
✔ [PASS] Test 4 — TTL Expiration & Sweeper Deletion - Expired secret cannot be read and was purged by background sweeper.
✔ [PASS] Test 5 — Ciphertext Tamper Detection - AES-256-GCM authentication tag rejected modified ciphertext cleanly.
✔ [PASS] Test 6 — Zero Plaintext in SQLite Storage - Verified raw database record: plaintext canary was NOT found in SQLite.
✔ [PASS] Test 7 — Cryptographic IV Uniqueness - Generated 50 secrets: exactly 50 distinct 12-byte random IVs.
✔ [PASS] Test 8 — Physical SQLite Hard Deletion - Row physically deleted on zero views; no soft-deletion flag used.

──────────────────────────────────────────────────────────────────────
TOTAL TESTS: 8 | PASSED: 8 | FAILED: 0
──────────────────────────────────────────────────────────────────────
```

---

## 9. Limitations

1. **Host Memory Disclosure**: If an adversary possesses root access to the physical host running the Node.js process, they could inspect memory to dump `VAULT_MASTER_KEY`.
2. **Recipient Exfiltration**: Cryptography cannot prevent a human recipient from copying, photographing, or recording the plaintext after explicit revelation.
3. **Traffic Timing Correlation**: Metadata such as ciphertext byte size and request timestamps could allow traffic analysis in untrusted network environments.

---

## 10. Future Improvements

1. **Client-Side WebCrypto Envelope**: Encrypt in the browser using WebCrypto SubtleCrypto before sending to server for true zero-knowledge end-to-end encryption.
2. **Decoy Payload Generation**: Store randomized padding to normalize ciphertext sizes and eliminate byte-length leakage.
3. **Hardware Security Module (HSM)**: Integrate AWS KMS, Google Cloud KMS, or HashiCorp Vault for hardware-backed master key wrapping.

---

## 11. Quickstart

```bash
# 1. Install & build
npm run install:all
npm run build

# 2. Run backend & frontend
npm run dev

# 3. Execute automated security tests
npm test --prefix backend
```
