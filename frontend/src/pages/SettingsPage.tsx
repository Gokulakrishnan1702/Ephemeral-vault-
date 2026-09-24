import React, { useState } from 'react';
import { Settings, User, Shield, Sliders, Terminal, Check, Bell, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [devMode, setDevMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    addToast('success', 'Preferences saved successfully.');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Title */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
          <Settings className="w-3.5 h-3.5" />
          Preferences & Configuration
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Vault Settings
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Manage your account profile, security controls, interface visual settings, and developer endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account Profile */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Account Information
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Display Name</label>
              <input
                type="text"
                disabled
                value={user?.name || 'Local Operator'}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 select-all"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Email Identifier</label>
              <input
                type="text"
                disabled
                value={user?.email || 'operator@vault.local'}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 select-all"
              />
            </div>
          </div>
        </div>

        {/* Security Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            Security & Alerts
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-semibold">Security Notifications</div>
                <div className="text-slate-400 text-[11px]">Notify on link burn or crawler deflect</div>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <div className="text-slate-200 font-semibold">Automatic Session Timeout</div>
                <div className="text-slate-400 text-[11px]">Expires after 7 days inactivity</div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">ENFORCED</span>
            </div>
          </div>
        </div>

        {/* Interface Preferences */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Moon className="w-4 h-4 text-sky-400" />
            Interface & Theme
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-semibold">Active Theme</div>
                <div className="text-slate-400 text-[11px]">Cyberpunk Navy / Neon Cyan</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                CYBER-DARK
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <div className="text-slate-200 font-semibold">Particle & Micro-Animations</div>
                <div className="text-slate-400 text-[11px]">Rotating security rings and glows</div>
              </div>
              <input
                type="checkbox"
                checked={animations}
                onChange={(e) => setAnimations(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </div>
          </div>
        </div>

        {/* Developer & API Configuration */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Developer Controls
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Backend API Target</label>
              <input
                type="text"
                disabled
                value="http://localhost:3000/api"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-semibold">Security Testing Mode</div>
                <div className="text-slate-400 text-[11px]">Enables live 20x concurrency tests</div>
              </div>
              <input
                type="checkbox"
                checked={devMode}
                onChange={(e) => setDevMode(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center gap-2"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          <span>{saved ? 'Preferences Saved' : 'Save Preferences'}</span>
        </button>
      </div>

    </div>
  );
};
