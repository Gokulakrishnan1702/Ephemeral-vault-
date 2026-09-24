import React, { useState, useEffect } from 'react';
import { Shield, Lock, ArrowRight, Zap, Flame, EyeOff, Bot, Key, CheckCircle } from 'lucide-react';
import { HeroIllustration } from '../components/HeroIllustration.js';
import { FeatureCards } from '../components/FeatureCards.js';
import { HowItWorks } from '../components/HowItWorks.js';
import { api, SecurityStats } from '../services/api.js';

interface HomePageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<SecurityStats | null>(null);

  useEffect(() => {
    api.getSecurityStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wide shadow-glow-cyan">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>SECRET INGESTION → ENCRYPTED VAULT → SAFE BURN</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Share sensitive information securely.{' '}
              <span className="cyber-gradient-text">Reveal once.</span>{' '}
              Destroy automatically.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Protect database passwords, API keys, access tokens, certificates, and <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-xs font-mono">.env</code> files with hardware-authenticated AES-256-GCM encrypted, self-destructing links.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={() => onNavigate('create')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm tracking-wide shadow-glow-cyan transition-all flex items-center justify-center gap-2 group"
              >
                <Lock className="w-4 h-4" />
                <span>Create Secure Secret</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('architecture')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>See How It Works</span>
              </button>
            </div>

            {/* Micro guarantees */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  Zero Plaintext
                </div>
                <div className="text-[11px] text-slate-400">Never in DB or logs</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  Bot Defense
                </div>
                <div className="text-[11px] text-slate-400">Slack & crawler safe</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  Safe Burn
                </div>
                <div className="text-[11px] text-slate-400">GET never destroys</div>
              </div>
            </div>
          </div>

          {/* Right Hero Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroIllustration />
          </div>

        </div>
      </section>

      {/* Live Vault Telemetry Ribbon */}
      <section className="border-y border-slate-800/80 bg-slate-950/70 py-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                {stats?.total_created ?? 0}
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wider">
                Total Secrets Vaulted
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                {stats?.active_secrets ?? 0}
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wider">
                Active In Vault
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
                {stats?.destroyed_secrets ?? 0}
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wider">
                Permanently Burned
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
                {stats?.blocked_crawlers ?? 0}
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wider">
                Scrapers Deflected
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Feature Cards */}
      <FeatureCards />

      {/* How It Works 4-Step Process */}
      <HowItWorks />

      {/* Interactive Quick Banner */}
      <section className="py-20 max-w-5xl mx-auto px-4 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to share credentials with zero residue?
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8">
            Create an encrypted, self-destructing secret in 5 seconds. No plaintext logged, no crawler leaks, guaranteed atomic hard-deletion.
          </p>
          <button
            onClick={() => onNavigate('create')}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm shadow-glow-cyan transition-all inline-flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Create Secure Secret Now
          </button>
        </div>
      </section>
    </div>
  );
};
