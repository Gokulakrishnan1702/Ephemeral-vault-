import React from 'react';
import { Flame, ShieldAlert, ArrowLeft, PlusCircle, CheckCircle } from 'lucide-react';

interface SecretDestroyedPageProps {
  onNavigateHome: () => void;
}

export const SecretDestroyedPage: React.FC<SecretDestroyedPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Burned Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mx-auto mb-6 flex items-center justify-center shadow-glow-danger">
          <Flame className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
          Secret No Longer Available
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
          This secret cannot be retrieved. It may have been burned after reading, expired via TTL, or the link is invalid.
        </p>

        {/* Diagnostic checklist */}
        <div className="space-y-2.5 max-w-sm mx-auto text-left mb-8">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <span>Already revealed and burned by recipient</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span>TTL expiration reached and purged by sweeper</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
            <span>Maximum allowable views consumed</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Vault Home
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-glow-cyan transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Secret
          </button>
        </div>

      </div>
    </div>
  );
};
