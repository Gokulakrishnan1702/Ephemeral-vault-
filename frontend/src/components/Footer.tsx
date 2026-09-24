import React from 'react';
import { ShieldCheck, Database, Zap, Cpu, Terminal, Flame, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#04060f] text-slate-400 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Ephemeral Secret Vault</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              SECRET INGESTION → ENCRYPTED VAULT → SAFE BURN
            </p>
            <p className="text-[11px] text-slate-500">
              Enterprise-grade zero-plaintext self-destructing secret sharing platform.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wider uppercase text-[11px]">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('create')} className="hover:text-cyan-400 transition-colors">
                  Create Secret
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-secrets')} className="hover:text-cyan-400 transition-colors">
                  My Secrets Vault
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('security')} className="hover:text-cyan-400 transition-colors">
                  Security Center & Tests
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cli')} className="hover:text-cyan-400 transition-colors">
                  CLI & Piping Helper
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Specs */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wider uppercase text-[11px]">Security</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('architecture')} className="hover:text-cyan-400 transition-colors">
                  Cryptographic Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('docs')} className="hover:text-cyan-400 transition-colors">
                  API & Threat Model
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-cyan-400 transition-colors">
                  Zero Plaintext Principle
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('security')} className="hover:text-cyan-400 transition-colors">
                  Database Inspector
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Engine Status Badges */}
          <div className="space-y-2.5">
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wider uppercase text-[11px]">System Status</h4>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                AES-256-GCM
              </span>
              <span className="text-emerald-400 font-mono text-[10px]">AUTHENTICATED</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                SQLite WAL
              </span>
              <span className="text-cyan-400 font-mono text-[10px]">ATOMIC</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                TTL Sweeper
              </span>
              <span className="text-rose-400 font-mono text-[10px]">RUNNING</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Ephemeral Secret Vault. Hardware-authenticated encryption. No plaintext on disk.
          </div>
          <div className="flex gap-4">
            <span className="text-slate-400">Master Key: Outside DB</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Hard Deletion: Enforced</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Scraper Defense: Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
