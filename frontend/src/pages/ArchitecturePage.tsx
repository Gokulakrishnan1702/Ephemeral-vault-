import React from 'react';
import { Cpu, ShieldCheck, Database, Flame, Bot, Lock, ArrowDown, Activity, Terminal } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const components = [
    {
      title: '01. API Gateway & Defense Layer',
      icon: ShieldCheck,
      badge: 'REQUEST INGESTION',
      accent: 'border-cyan-500/30 text-cyan-400',
      points: [
        'Security Headers (X-Content-Type-Options, X-Frame-Options, CSP)',
        'Scraper Protection Classifier: inspects User-Agent for Slackbot, Discordbot, etc.',
        'Request Correlation ID (X-Request-ID) for end-to-end tracing',
        'Strict Payload Validation: bounds checks on TTL (10s - 7d) and size limits',
      ],
    },
    {
      title: '02. Cryptographic Engine (AES-256-GCM)',
      icon: Lock,
      badge: 'AUTHENTICATED SYMMETRIC CIPHER',
      accent: 'border-purple-500/30 text-purple-400',
      points: [
        '256-bit Master Key loaded exclusively from environment (never stored in DB)',
        'Unique 96-bit (12-byte) random IV generated per secret using Node CSPRNG',
        'Galois/Counter Mode (GCM) generates 128-bit authentication tag',
        'Tamper Detection: single-bit modification fails GCM verification cleanly',
      ],
    },
    {
      title: '03. SQLite WAL Storage Engine',
      icon: Database,
      badge: 'ATOMIC STORAGE & ZERO-PLAINTEXT',
      accent: 'border-sky-500/30 text-sky-400',
      points: [
        'WAL (Write-Ahead Logging) Mode: concurrent read/write throughput',
        'Zero Plaintext: only ciphertext, IV, and auth_tag BLOBs stored in database',
        'Prepared Statements: 100% parameterized queries eliminating SQL injection',
        'Deterministic Hard Deletion: row is physically expunged upon final burn',
      ],
    },
    {
      title: '04. Background TTL Sweeper Daemon',
      icon: Flame,
      badge: 'AUTOMATIC ROW PURGING',
      accent: 'border-rose-500/30 text-rose-400',
      points: [
        'Periodic Garbage Collection: executes sweep every 15 seconds',
        'Hard Deletes expired secrets: DELETE FROM secrets WHERE expires_at <= ?',
        'Zero Residual Exposure: eliminates unread secrets after expiration',
        'Sanitized Telemetry: logs purge counts without ever logging plaintext',
      ],
    },
    {
      title: '05. Security Audit & Testing Engine',
      icon: Activity,
      badge: 'CONTINUOUS INVARIANT TESTING',
      accent: 'border-emerald-500/30 text-emerald-400',
      points: [
        '20x Atomic Concurrency Race verification: 1 winner, 19 rejections',
        'Live Tamper Test: bit inversion verification of GCM authentication failure',
        'Live Database Inspector: verifies zero plaintext presence in SQLite rows',
        'Full 8-Test Automated Security Test Suite executable in browser & terminal',
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
          <Cpu className="w-3.5 h-3.5" />
          System Blueprints & Cryptographic Topology
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Security Architecture
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Detailed technical design of the end-to-end secret ingestion, cryptographic encryption, and safe burn pipeline.
        </p>
      </div>

      {/* Visual Pipeline Flow Diagram */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl space-y-6">
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300 text-center">
          Cryptographic Lifecycle Architecture Diagram
        </h3>

        <div className="flex flex-col items-center gap-3 max-w-md mx-auto font-mono text-xs text-center">
          <div className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200">
            Client Browser / Terminal Pipeline
          </div>
          <ArrowDown className="w-4 h-4 text-cyan-400" />
          
          <div className="w-full p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 shadow-glow-cyan">
            API Gateway (Bot Detector + Rate Limiter)
          </div>
          <ArrowDown className="w-4 h-4 text-cyan-400" />

          <div className="w-full p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 shadow-glow-purple">
            Crypto Engine (AES-256-GCM + 12B Random IV + 16B Auth Tag)
          </div>
          <ArrowDown className="w-4 h-4 text-purple-400" />

          <div className="w-full p-3 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-200">
            SQLite Storage Engine (WAL Mode • Zero Plaintext)
          </div>
          <ArrowDown className="w-4 h-4 text-sky-400" />

          <div className="w-full p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 shadow-glow-danger">
            Safe Burn Transaction / TTL Sweeper Daemon (Hard Delete)
          </div>
        </div>
      </div>

      {/* Detailed Architectural Components */}
      <div className="space-y-6">
        {components.map((comp, idx) => {
          const Icon = comp.icon;
          return (
            <div
              key={idx}
              className={`p-6 sm:p-8 rounded-2xl bg-slate-900/60 backdrop-blur-md border ${comp.accent} space-y-4`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{comp.title}</h3>
                </div>
                <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded bg-slate-950 border border-slate-800 self-start sm:self-auto">
                  {comp.badge}
                </span>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {comp.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

    </div>
  );
};
