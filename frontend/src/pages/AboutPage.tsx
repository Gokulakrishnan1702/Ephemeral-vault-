import React from 'react';
import { ShieldCheck, Heart, Lock, Key, Database, Flame, Terminal, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Zero-Trust Ephemeral Sharing
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          About Ephemeral Secret Vault
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          SECRET INGESTION → ENCRYPTED VAULT → SAFE BURN
        </p>
      </div>

      {/* Mission Statement */}
      <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <h2 className="text-xl font-bold text-white">The Problem with Traditional Secret Sharing</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Engineers and DevOps teams frequently share database passwords, API keys, access tokens, and private certificates through chat apps (Slack, Teams, Discord, WhatsApp) or static pastebins.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          This leaves persistent plaintexts in chat histories, automated backup archives, search indexes, and server logs. Even worse, standard pastebins use soft deletion (<code className="text-cyan-300 font-mono">is_deleted = true</code>), meaning your database administrator or a database dump still exposes the credentials forever!
        </p>
      </div>

      {/* Core Tenets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 w-fit">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero Plaintext</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Plaintext is never written to disk, databases, or logs. AES-256-GCM symmetric encryption happens before storage.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 w-fit">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Deterministic Burn</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Viewing a secret physically hard-deletes the row from SQLite. No soft-delete flags. Unread secrets are swept automatically via TTL.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Scraper Immunity</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated crawler bots and link-preview spiders from Slack or WhatsApp are deflected so they cannot burn secrets prematurely.
          </p>
        </div>
      </div>

    </div>
  );
};
