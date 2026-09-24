import React, { useState, useEffect } from 'react';
import {
  Unlock,
  Copy,
  Eye,
  EyeOff,
  Flame,
  Check,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { BurnResult } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';

interface SecretRevealedPageProps {
  data: BurnResult;
  onNavigateHome: () => void;
}

export const SecretRevealedPage: React.FC<SecretRevealedPageProps> = ({ data, onNavigateHome }) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showPlaintext, setShowPlaintext] = useState(true);

  // Clear memory on unmount
  useEffect(() => {
    return () => {
      // Intentionally clear out internal reference on unmount
      data.secret = '';
    };
  }, [data]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.secret);
      setCopied(true);
      addToast('success', 'Secret copied to clipboard!', 'Copied');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast('error', 'Failed to copy secret.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-emerald-500/30 shadow-2xl backdrop-blur-xl relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mx-auto mb-4 flex items-center justify-center shadow-glow-green">
            <Unlock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Secret Revealed
          </h1>
          <p className="mt-1 text-slate-400 text-xs sm:text-sm">
            Decrypted with AES-256-GCM. The database record has been destroyed.
          </p>
        </div>

        {/* Destruction Notification Callout */}
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-6 flex items-center gap-2.5">
          <Flame className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Permanently Burned:</strong> This secret row was hard-deleted from SQLite. Reloading this link will return HTTP 404.
          </span>
        </div>

        {/* Plaintext Container */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase text-[11px]">Decrypted Payload</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPlaintext(!showPlaintext)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
              >
                {showPlaintext ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
                {showPlaintext ? 'Hide Content' : 'Show Content'}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3 py-1 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-glow-green'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Secret'}
              </button>
            </div>
          </div>

          <div className="relative">
            <pre
              className={`w-full p-4 rounded-xl bg-slate-950 border border-slate-700/80 font-mono text-sm text-cyan-200 overflow-x-auto whitespace-pre-wrap break-all select-all ${
                !showPlaintext ? 'blur-md select-none' : ''
              }`}
            >
              {data.secret}
            </pre>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-8 text-center">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400">Views Remaining</span>
            <div className="text-xs font-bold text-rose-400 font-mono">{data.views_remaining}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400">Status</span>
            <div className="text-xs font-bold text-rose-400 uppercase font-mono">Destroyed</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400">Disk Residue</span>
            <div className="text-xs font-bold text-emerald-400 uppercase font-mono">0 Bytes</div>
          </div>
        </div>

        {/* Back action */}
        <button
          onClick={onNavigateHome}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Vault Home</span>
        </button>

      </div>
    </div>
  );
};
