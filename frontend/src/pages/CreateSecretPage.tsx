import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Clock,
  KeyRound,
  ShieldCheck,
  Zap,
  Bot,
  Flame,
  Key,
  Database,
  FileCode,
  FileText
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';

interface CreateSecretPageProps {
  onSuccess: (data: any) => void;
}

export const CreateSecretPage: React.FC<CreateSecretPageProps> = ({ onSuccess }) => {
  const { addToast } = useToast();

  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(true);
  const [secretType, setSecretType] = useState('Password');
  const [ttlPreset, setTtlPreset] = useState<number>(3600);
  const [customTtl, setCustomTtl] = useState<string>('');
  const [maxViews, setMaxViews] = useState<number>(1);
  const [passphrase, setPassphrase] = useState('');
  const [enablePassphrase, setEnablePassphrase] = useState(false);
  const [loading, setLoading] = useState(false);

  const secretTypes = [
    { id: 'Password', label: 'Password', icon: Key },
    { id: 'API Key', label: 'API Key', icon: Zap },
    { id: 'Access Token', label: 'Access Token', icon: Lock },
    { id: 'Certificate', label: 'Certificate', icon: ShieldCheck },
    { id: '.env File', label: '.env File', icon: FileCode },
    { id: 'Database Credential', label: 'Database Credential', icon: Database },
    { id: 'Custom Secret', label: 'Custom Secret', icon: FileText },
  ];

  const ttlPresets = [
    { label: '1 Minute', seconds: 60 },
    { label: '5 Minutes', seconds: 300 },
    { label: '15 Minutes', seconds: 900 },
    { label: '1 Hour', seconds: 3600 },
    { label: '24 Hours', seconds: 86400 },
    { label: 'Custom', seconds: -1 },
  ];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSecret(text);
      addToast('info', 'Content pasted from clipboard.');
    } catch {
      addToast('warning', 'Clipboard access denied by browser.');
    }
  };

  const handleClear = () => {
    setSecret('');
    addToast('info', 'Secret content cleared.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secret.trim()) {
      addToast('error', 'Please enter a secret to encrypt.');
      return;
    }

    let finalTtl = ttlPreset;
    if (ttlPreset === -1) {
      const parsed = parseInt(customTtl, 10);
      if (isNaN(parsed) || parsed < 10) {
        addToast('error', 'Custom TTL must be at least 10 seconds.');
        return;
      }
      finalTtl = parsed;
    }

    setLoading(true);
    try {
      const result = await api.createSecret({
        secret: secret.trim(),
        ttl_seconds: finalTtl,
        max_views: maxViews,
        secret_type: secretType,
        passphrase: enablePassphrase && passphrase.trim() ? passphrase.trim() : undefined,
      });

      // Clear plaintext input from memory immediately
      setSecret('');
      setPassphrase('');
      addToast('success', 'Secret vaulted & encrypted with AES-256-GCM!', 'Success');
      onSuccess(result);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to encrypt secret', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          AES-256-GCM Vault Ingestion
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Create a Secure Secret
        </h1>
        <p className="mt-2 text-slate-400 text-sm">
          Your secret will be encrypted before it enters the vault. Zero plaintext touches disk or logs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Secret Type Selection */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-3">
            01. Secret Type Classification
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {secretTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = secretType === type.id;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setSecretType(type.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-glow-cyan'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`} />
                  <span className="text-xs font-medium truncate">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Secret Payload Input */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
              02. Sensitive Confidential Secret
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePaste}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3 h-3 text-cyan-400" />
                Paste
              </button>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
              >
                {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-cyan-400" />}
                {showSecret ? 'Hide' : 'Show'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={!secret}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={6}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Paste password, private certificate, API key, .env contents, or confidential token here..."
              className={`w-full p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-500/60 transition-colors resize-y ${
                !showSecret ? 'blur-sm select-none' : ''
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Client memory cleared on encryption. Not saved to localStorage.</span>
            <span className="font-mono">{secret.length} characters</span>
          </div>
        </div>

        {/* Step 3: Lifecycle Settings (TTL & Max Views) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TTL Preset */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              03. Expiration Lifetime (TTL)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ttlPresets.map((preset) => {
                const isSelected = ttlPreset === preset.seconds;
                return (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => setTtlPreset(preset.seconds)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            {ttlPreset === -1 && (
              <div className="pt-2">
                <input
                  type="number"
                  placeholder="TTL in seconds (min 10s)"
                  value={customTtl}
                  onChange={(e) => setCustomTtl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            )}
          </div>

          {/* Max Views */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              04. Maximum Views Before Burn
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((views) => {
                const isSelected = maxViews === views;
                return (
                  <button
                    type="button"
                    key={views}
                    onClick={() => setMaxViews(views)}
                    className={`py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-glow-danger'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {views === 1 ? '1 View (Default)' : `${views} Views`}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              When views reach 0, SQLite executes physical hard deletion immediately.
            </p>
          </div>
        </div>

        {/* Optional Secondary Passphrase */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              Optional Passphrase Protection
            </label>
            <input
              type="checkbox"
              checked={enablePassphrase}
              onChange={(e) => setEnablePassphrase(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
          {enablePassphrase && (
            <input
              type="password"
              placeholder="Recipient must supply this passphrase to decrypt..."
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          )}
        </div>

        {/* Security Summary & Submit */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left w-full sm:w-auto">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Cipher</div>
              <div className="text-xs font-bold text-cyan-300">AES-256-GCM</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">IV Entropy</div>
              <div className="text-xs font-bold text-white">96-Bit Random</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Storage</div>
              <div className="text-xs font-bold text-white">SQLite WAL</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Scraper Defense</div>
              <div className="text-xs font-bold text-emerald-400">ENABLED</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm tracking-wide shadow-glow-cyan transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Encrypting & Ingesting...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Create Secure Secret</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
