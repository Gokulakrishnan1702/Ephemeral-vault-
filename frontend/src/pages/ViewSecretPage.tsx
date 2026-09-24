import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Flame,
  Clock,
  KeyRound,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle,
  Database,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { api, SecretMetadata, BurnResult } from '../services/api.js';
import { RevealModal } from '../components/RevealModal.js';
import { SecretDestroyedPage } from './SecretDestroyedPage.js';
import { useToast } from '../context/ToastContext.js';

interface ViewSecretPageProps {
  secretId: string;
  onNavigateHome: () => void;
}

export const ViewSecretPage: React.FC<ViewSecretPageProps> = ({ secretId, onNavigateHome }) => {
  const { addToast } = useToast();

  const [metadata, setMetadata] = useState<SecretMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [burnResult, setBurnResult] = useState<BurnResult | null>(null);
  const [timeRemainingStr, setTimeRemainingStr] = useState<string>('Calculating...');
  
  // Revealed state controls
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);

  // Safe Metadata Probe on mount - DOES NOT DECRYPT OR CONSUME VIEWS
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getSecretMeta(secretId)
      .then((meta) => {
        if (isMounted) {
          setMetadata(meta);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [secretId]);

  // Live TTL countdown timer
  useEffect(() => {
    if (!metadata) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = metadata.expires_at - now;

      if (diff <= 0) {
        setTimeRemainingStr('EXPIRED');
        setNotFound(true);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');
      if (hours > 0) {
        setTimeRemainingStr(`${pad(hours)}:${pad(minutes)}:${pad(seconds)} remaining`);
      } else {
        setTimeRemainingStr(`${pad(minutes)}:${pad(seconds)} remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [metadata]);

  // Handle explicit Reveal & Burn trigger
  const handleRevealClick = () => {
    if (metadata?.has_passphrase) {
      setModalOpen(true);
    } else {
      // Direct instant reveal and burn - no extra popup modal needed!
      executeBurn();
    }
  };

  const executeBurn = async (passphrase?: string) => {
    setIsBurning(true);
    try {
      const result = await api.burnSecret(secretId, passphrase);
      setBurnResult(result);
      setModalOpen(false);
      addToast('success', 'Secret revealed successfully! Row burned from vault.', 'Decrypted');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to reveal secret', 'Burn Error');
    } finally {
      setIsBurning(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!burnResult) return;
    try {
      await navigator.clipboard.writeText(burnResult.secret);
      setCopied(true);
      addToast('success', 'Password copied to clipboard!', 'Copied');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast('error', 'Failed to copy password.');
    }
  };

  const handleImmediateHardDelete = async () => {
    if (!window.confirm('Wipe all remaining views and permanently erase this row from SQLite now?')) {
      return;
    }
    try {
      await api.deleteSecret(secretId);
      addToast('success', 'Secret permanently wiped from database.', 'Hard Deleted');
      if (burnResult) {
        setBurnResult({
          ...burnResult,
          views_remaining: 0,
          status: 'destroyed',
        });
      }
    } catch (err: any) {
      addToast('error', 'Failed to wipe secret');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-glow-cyan animate-pulse">
          <Lock className="w-6 h-6 text-cyan-300" />
        </div>
        <p className="text-slate-400 font-mono text-xs">Querying Vault Safe Landing Metadata...</p>
      </div>
    );
  }

  // If secret has already been revealed or is missing
  if (notFound || !metadata) {
    return <SecretDestroyedPage onNavigateHome={onNavigateHome} />;
  }

  // =========================================================================
  // VIEW STATE 1: ALREADY REVEALED PASSWORD
  // =========================================================================
  if (burnResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/40 shadow-2xl backdrop-blur-xl relative space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-glow-green animate-pulse">
              <Unlock className="w-8 h-8" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block">
              🔓 DECRYPTED {burnResult.secret_type.toUpperCase()}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Password Revealed
            </h1>
            <p className="text-xs text-slate-400">
              Decrypted via AES-256-GCM. Below is your plaintext secret.
            </p>
          </div>

          {/* LARGE PROMINENT PASSWORD DISPLAY BOX */}
          <div className="p-6 rounded-2xl bg-slate-950 border-2 border-cyan-500/40 shadow-inner space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="font-mono text-cyan-300 font-semibold uppercase tracking-wider">
                Revealed Content:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-glow-green'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Password'}</span>
                </button>
              </div>
            </div>

            {/* PASSWORD TEXT */}
            <div className="relative py-2">
              <pre
                className={`text-lg sm:text-2xl font-mono font-bold text-cyan-200 select-all whitespace-pre-wrap break-all leading-relaxed ${
                  !showPassword ? 'blur-md select-none' : ''
                }`}
              >
                {burnResult.secret}
              </pre>
            </div>
          </div>

          {/* DESTRUCTION & VIEWS STATUS */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${burnResult.views_remaining <= 0 ? 'text-rose-400' : 'text-amber-400'}`} />
                <span className="text-slate-300">
                  <strong>Vault Status:</strong>{' '}
                  {burnResult.views_remaining <= 0 ? (
                    <span className="text-rose-400 font-bold">PERMANENTLY BURNED & DELETED FROM DATABASE</span>
                  ) : (
                    <span className="text-amber-400 font-bold">{burnResult.views_remaining} view(s) remaining</span>
                  )}
                </span>
              </div>

              {burnResult.views_remaining > 0 && (
                <button
                  onClick={handleImmediateHardDelete}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-danger transition-colors self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Destroy Remaining Views Now</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
              {burnResult.views_remaining <= 0
                ? '🔥 The SQLite database row has been physically wiped from disk. Any refresh or re-visit will safely return HTTP 404.'
                : '⚠ This secret has remaining view(s). You can destroy it now to prevent any further access.'}
            </p>
          </div>

          {/* Action buttons */}
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
  }

  // =========================================================================
  // VIEW STATE 2: SAFE LANDING PAGE (PASSWORD NOT YET REVEALED)
  // =========================================================================
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-cyan-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center space-y-6">
        
        {/* Top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Central Encrypted Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 text-cyan-300 mx-auto flex items-center justify-center shadow-glow-cyan">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 text-xs font-mono text-cyan-300">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeRemainingStr}</span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            You have been sent a secure, self-destructing secret.
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mt-2">
            This secret is encrypted on the server with AES-256-GCM. Opening this page did not reveal or destroy it. Click below to reveal and show the password.
          </p>
        </div>

        {/* Meta badges */}
        <div className="grid grid-cols-2 gap-3 text-left max-w-md mx-auto">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400">Secret Type</span>
            <div className="text-xs font-bold text-white truncate">{metadata.secret_type}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400">Views Remaining</span>
            <div className="text-xs font-bold text-rose-400">
              {metadata.views_remaining} of {metadata.max_views} Allowed
            </div>
          </div>
        </div>

        {/* Safe Burn Warning */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-200 text-xs flex items-start gap-3 text-left max-w-md mx-auto">
          <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-300 mb-0.5">Safe Burn Warning</div>
            <p className="text-[11px] text-rose-200/90 leading-relaxed">
              Upon clicking reveal, the secret ciphertext will be decrypted and displayed on your screen, and this view will be burned.
            </p>
          </div>
        </div>

        {/* Big Direct Reveal Button */}
        <button
          onClick={handleRevealClick}
          disabled={isBurning}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-glow-danger transition-all flex items-center justify-center gap-3 mx-auto group cursor-pointer disabled:opacity-50"
        >
          {isBurning ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Decrypting AES-256-GCM...</span>
            </>
          ) : (
            <>
              <Unlock className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Reveal & Show Password Now</span>
            </>
          )}
        </button>

      </div>

      {/* Confirmation / Passphrase Modal if needed */}
      <RevealModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={executeBurn}
        hasPassphrase={metadata.has_passphrase}
        isBurning={isBurning}
      />
    </div>
  );
};
