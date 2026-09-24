import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Key, Flame, Zap, Database, CheckCircle, FileText } from 'lucide-react';

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg aspect-square mx-auto flex items-center justify-center select-none">
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-sky-500/10 to-purple-600/25 rounded-full blur-3xl -z-10 animate-pulse-slow" />

      {/* Orbit Ring 1 (Outer) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-4 border border-cyan-500/20 rounded-full border-dashed"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full shadow-glow-cyan flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
        <div className="absolute bottom-4 right-10 w-3 h-3 bg-purple-400 rounded-full shadow-glow-purple" />
      </motion.div>

      {/* Orbit Ring 2 (Middle) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-16 border border-purple-500/25 rounded-full"
      >
        <div className="absolute top-1/4 left-0 -translate-x-1/2 w-3 h-3 bg-sky-400 rounded-full shadow-glow-cyan" />
        <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-glow-green" />
      </motion.div>

      {/* Center Cyber Vault Core */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-64 h-64 rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#070b1a]/95 border border-cyan-500/30 p-6 flex flex-col items-center justify-center shadow-2xl backdrop-blur-xl"
      >
        {/* Top vault dial status */}
        <div className="absolute -top-3 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 shadow-glow-cyan flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          AES-256-GCM VAULT
        </div>

        {/* Central Lock Graphic */}
        <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/15 to-purple-600/30 border border-cyan-400/40 flex items-center justify-center shadow-glow-cyan"
          >
            <Lock className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
          </motion.div>
          
          {/* Subtle orbiting encryption particle */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow-cyan" />
          </motion.div>
        </div>

        {/* Flow Indicators */}
        <div className="text-center space-y-1">
          <div className="text-xs font-bold text-white tracking-wide">
            CRYPTO ENGINE ACTIVE
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            IV: 96-BIT RANDOM • TAG: 128-BIT
          </div>
        </div>

        {/* Bottom Security Tags */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            ONE-TIME BURN
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            WAL MODE
          </span>
        </div>
      </motion.div>

      {/* Floating Telemetry Badges */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-2 right-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-xl flex items-center gap-2.5 z-20"
      >
        <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
          <CheckCircle className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="text-[11px] font-semibold text-slate-200">Zero Plaintext</div>
          <div className="text-[9px] font-mono text-emerald-400">ENCRYPTED ON DISK</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-4 left-4 p-3 rounded-2xl bg-slate-900/90 border border-rose-500/30 backdrop-blur-md shadow-xl flex items-center gap-2.5 z-20"
      >
        <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
          <Flame className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="text-[11px] font-semibold text-slate-200">Atomic Safe Burn</div>
          <div className="text-[9px] font-mono text-rose-400">HARD DELETE ON REVEAL</div>
        </div>
      </motion.div>
    </div>
  );
};
