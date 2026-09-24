import React from 'react';
import { SecretMetadata } from '../services/api.js';
import { X, ShieldCheck, Key, Clock, Flame, Database, FileText } from 'lucide-react';

interface SecretDetailsModalProps {
  secret: SecretMetadata | null;
  onClose: () => void;
}

export const SecretDetailsModal: React.FC<SecretDetailsModalProps> = ({ secret, onClose }) => {
  if (!secret) return null;

  const now = Date.now();
  const timeDiff = secret.expires_at - now;
  const isExpired = timeDiff <= 0;

  let timeRemainingFormatted = 'EXPIRED';
  if (!isExpired) {
    const mins = Math.floor(timeDiff / 60000);
    const secs = Math.floor((timeDiff % 60000) / 1000);
    timeRemainingFormatted = `${mins}m ${secs}s`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cryptographic Metadata</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {secret.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500">Secret Type</div>
            <div className="text-sm font-semibold text-cyan-300 mt-0.5">{secret.secret_type}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500">Status</div>
            <div className="text-sm font-semibold text-white mt-0.5">{secret.status || 'Active'}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500">Created At</div>
            <div className="text-xs font-mono text-slate-300 mt-0.5">{new Date(secret.created_at).toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500">Expires At</div>
            <div className="text-xs font-mono text-slate-300 mt-0.5">{new Date(secret.expires_at).toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500">Time Remaining</div>
            <div className="text-xs font-mono font-bold text-amber-300 mt-0.5">{timeRemainingFormatted}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500">View Allowance</div>
            <div className="text-xs font-mono font-bold text-rose-300 mt-0.5">
              {secret.views_remaining} / {secret.max_views} Views
            </div>
          </div>
        </div>

        {/* Cryptographic Spec Guarantee */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/20 space-y-2 text-[11px] font-mono">
          <div className="text-cyan-400 font-bold uppercase text-[10px]">Encryption Parameters</div>
          <div className="flex justify-between text-slate-400">
            <span>Algorithm:</span>
            <span className="text-slate-200">AES-256-GCM Authenticated</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>IV Length:</span>
            <span className="text-slate-200">12 Bytes (96-Bit Random CSPRNG)</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Auth Tag:</span>
            <span className="text-slate-200">16 Bytes (128-Bit Poly1305 / GMAC)</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Plaintext Stored:</span>
            <span className="text-emerald-400 font-bold">NO (0 BYTES ON DISK)</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
        >
          Close Details
        </button>
      </div>
    </div>
  );
};
