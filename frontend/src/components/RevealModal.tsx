import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Flame, KeyRound, X, ShieldAlert } from 'lucide-react';

interface RevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (passphrase?: string) => void;
  hasPassphrase?: boolean;
  isBurning?: boolean;
}

export const RevealModal: React.FC<RevealModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hasPassphrase = false,
  isBurning = false,
}) => {
  const [passphrase, setPassphrase] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/30 p-6 shadow-glow-danger text-slate-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isBurning}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Confirm Safe Burn</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  IRREVERSIBLE
                </span>
              </h3>
              <p className="text-xs text-slate-400">Atomic permanent database destruction</p>
            </div>
          </div>

          <div className="space-y-4 my-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Once revealed, this secret row will be <strong className="text-rose-400">permanently wiped from SQLite storage</strong>. 
                Any refresh or second visit will return HTTP 404.
              </span>
            </div>

            {hasPassphrase && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  Secondary Passphrase Required
                </label>
                <input
                  type="password"
                  placeholder="Enter decrypt passphrase..."
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isBurning}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(passphrase || undefined)}
              disabled={isBurning}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-xs font-bold text-white shadow-glow-danger transition-all flex items-center justify-center gap-2"
            >
              {isBurning ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Burning...
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  Reveal & Destroy
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
