import React from 'react';
import { BookOpen, ShieldCheck, Database, Flame, Bot, Zap, Clock, Terminal, Lock } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          Technical Manual & API Specification
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          System Documentation & Threat Model
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Cryptographic implementation details, lifecycle invariants, and API interface specifications.
        </p>
      </div>

      {/* Section 1: Overview */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          1. What is Ephemeral Secret Vault?
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <p>
            Ephemeral Secret Vault is a secure, zero-residue self-destructing secret-sharing platform designed for sharing production credentials, API access tokens, private keys, database passwords, and environment files.
          </p>
          <p>
            Unlike traditional pastebins or notes applications, Ephemeral Vault strictly enforces:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong className="text-white">Zero Plaintext Storage:</strong> Secret plaintext is encrypted immediately upon ingestion and never written to SQLite, filesystem disks, or application logs.</li>
            <li><strong className="text-white">Deterministic Row Burn:</strong> After the recipient completes their allowed views, the SQLite database row is physically purged via hard deletion.</li>
            <li><strong className="text-white">Link-Preview Neutralization:</strong> Automated crawler bots from messaging platforms (Slack, Discord, WhatsApp) cannot trigger view decrimation or premature destruction.</li>
          </ul>
        </div>
      </section>

      {/* Section 2: Cryptographic Engine */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-400" />
          2. Cryptographic Engine (AES-256-GCM)
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <p>
            The vault uses hardware-accelerated <strong>AES-256-GCM (Galois/Counter Mode)</strong> symmetric encryption provided natively by the Node.js <code className="text-cyan-300 font-mono">crypto</code> subsystem.
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5 text-slate-400">
            <div><span className="text-cyan-300 font-semibold">Master Key:</span> 256 bits (32 bytes) loaded from <code className="text-white">VAULT_MASTER_KEY</code> environment variable.</div>
            <div><span className="text-cyan-300 font-semibold">Initialization Vector (IV):</span> 96 bits (12 bytes) generated via <code className="text-white">crypto.randomBytes(12)</code> per secret.</div>
            <div><span className="text-cyan-300 font-semibold">Authentication Tag:</span> 128 bits (16 bytes) providing Galois MAC tamper detection.</div>
          </div>
          <p>
            Any single bit modification to the stored ciphertext or IV causes the cryptographic authentication check to fail cleanly without decrypting or leaking corrupted plaintext.
          </p>
        </div>
      </section>

      {/* Section 3: Safe Burn & Scraper Defense */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-400" />
          3. Safe Landing & Anti-Scraper Shield
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <p>
            A common vulnerability in self-destructing links is that chat applications (such as Slack, Discord, Microsoft Teams, or WhatsApp) send automated crawler bots to fetch OpenGraph title tags. If the <code className="text-cyan-300 font-mono">GET</code> request automatically burns the secret, the link is destroyed before the human recipient ever clicks it!
          </p>
          <p>
            Ephemeral Secret Vault solves this through two complementary defenses:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-400">
            <li><strong>GET Requests Never Burn:</strong> Visiting <code className="text-white font-mono">GET /view/:id</code> merely loads the metadata landing page. It does not touch the ciphertext or decrement remaining views.</li>
            <li><strong>User-Agent Classifier:</strong> The <code className="text-cyan-300 font-mono">scraperProtectionMiddleware</code> detects automated crawlers and serves a static preview without ever initiating a burn session.</li>
          </ol>
        </div>
      </section>

      {/* Section 4: Concurrency & Storage Engine */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          4. Atomic Concurrency & SQLite WAL Engine
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <p>
            To prevent race conditions where parallel requests might read a 1-view secret simultaneously, all view decrementations are wrapped in an atomic SQLite transaction:
          </p>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-200 overflow-x-auto">
{`const atomicBurnTransaction = db.transaction((id, now) => {
  const row = db.prepare(\`
    SELECT * FROM secrets 
    WHERE id = ? AND views_remaining > 0 AND expires_at > ?
  \`).get(id, now);

  if (!row) return null;

  const remaining = row.views_remaining - 1;
  if (remaining <= 0) {
    db.prepare('DELETE FROM secrets WHERE id = ?').run(id); // HARD DELETE
  } else {
    db.prepare('UPDATE secrets SET views_remaining = ? WHERE id = ?').run(remaining, id);
  }
  return { ...row, views_remaining: remaining };
});`}
          </pre>
          <p>
            Because SQLite write transactions serialize execution, even under 20 parallel requests, exactly one request gets the valid row and the remaining 19 see null and receive HTTP 404.
          </p>
        </div>
      </section>

      {/* Section 5: API Documentation */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-sky-400" />
          5. REST API Reference
        </h2>

        {/* POST /api/secret */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">POST</span>
            <code className="text-sm font-mono text-white">/api/secret</code>
          </div>
          <p className="text-xs text-slate-400">Ingests, encrypts via AES-256-GCM, and vaults a confidential secret payload.</p>
          <div className="font-mono text-[11px] text-slate-400">Request Body:</div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
{`{
  "secret": "my-database-password-xyz",
  "ttl_seconds": 3600,
  "max_views": 1,
  "secret_type": "Database Credential",
  "passphrase": "optional-passphrase"
}`}
          </pre>
          <div className="font-mono text-[11px] text-slate-400">Response (201 Created):</div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300">
{`{
  "id": "e8a1b4c7d2e9",
  "view_url": "http://localhost:5173/view/e8a1b4c7d2e9",
  "expires_at": "2026-09-24T12:00:00.000Z",
  "max_views": 1,
  "views_remaining": 1,
  "secret_type": "Database Credential"
}`}
          </pre>
        </div>

        {/* GET /api/secret/:id/meta */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs">GET</span>
            <code className="text-sm font-mono text-white">/api/secret/:id/meta</code>
          </div>
          <p className="text-xs text-slate-400">Safe landing query. Never burns, decrypts, or decrements views.</p>
          <div className="font-mono text-[11px] text-slate-400">Response (200 OK):</div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
{`{
  "id": "e8a1b4c7d2e9",
  "secret_type": "Database Credential",
  "max_views": 1,
  "views_remaining": 1,
  "expires_at": 1727181600000,
  "has_passphrase": false
}`}
          </pre>
        </div>

        {/* POST /api/secret/:id/burn */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono font-bold text-xs">POST</span>
            <code className="text-sm font-mono text-white">/api/secret/:id/burn</code>
          </div>
          <p className="text-xs text-slate-400">The ONLY endpoint that decrypts and burns the secret. Hard deletes database row upon view exhaustion.</p>
          <div className="font-mono text-[11px] text-slate-400">Response (200 OK):</div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-rose-300">
{`{
  "id": "e8a1b4c7d2e9",
  "secret": "my-database-password-xyz",
  "secret_type": "Database Credential",
  "views_remaining": 0,
  "status": "destroyed",
  "burned_at": "2026-09-24T12:05:00.000Z"
}`}
          </pre>
        </div>

        {/* GET /health */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs">GET</span>
            <code className="text-sm font-mono text-white">/health</code>
          </div>
          <p className="text-xs text-slate-400">Health check probe for uptime monitors and container orchestrators.</p>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300">
{`{
  "status": "ok",
  "database": "connected",
  "encryption": "ready",
  "sweeper": "running"
}`}
          </pre>
        </div>
      </section>

    </div>
  );
};
