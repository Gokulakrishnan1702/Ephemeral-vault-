import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  PlusCircle,
  KeyRound,
  Terminal,
  BookOpen,
  Cpu,
  Info,
  LogOut,
  User as UserIcon,
  X,
  Activity,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  mobileOpen,
  setMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState<string>('checking');

  useEffect(() => {
    api.getHealth()
      .then((h) => {
        if (h.status === 'ok') setHealthStatus('online');
        else setHealthStatus('degraded');
      })
      .catch(() => setHealthStatus('offline'));
  }, []);

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileOpen(false);
  };

  const navGroups = [
    {
      title: 'Vault Management',
      items: [
        { id: 'home', label: 'Home', icon: Shield, desc: 'Overview & safe burn' },
        { id: 'my-secrets', label: 'My Secrets', icon: KeyRound, desc: 'Lifecycle & burn tracker' },
        { id: 'security', label: 'Security Center', icon: Activity, desc: 'Attack tests & telemetry' },
      ],
    },
    {
      title: 'Developer & Specs',
      items: [
        { id: 'cli', label: 'CLI Helper', icon: Terminal, desc: 'Stdin piping & shell' },
        { id: 'docs', label: 'Documentation', icon: BookOpen, desc: 'REST API & schemas' },
        { id: 'architecture', label: 'Architecture', icon: Cpu, desc: 'Threat model & WAL engine' },
        { id: 'about', label: 'About', icon: Info, desc: 'Ephemeral vault principles' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#070b1a] text-slate-200 border-r border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
      {/* 1. Header & Brand Section */}
      <div className="p-5 border-b border-cyan-500/15">
        <div className="flex items-center justify-between">
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-purple-600 p-[1.5px] transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
              <div className="w-full h-full bg-[#070b19] rounded-[9px] flex items-center justify-center">
                <Lock className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
              <div className="absolute -inset-1 bg-cyan-500/20 rounded-xl blur group-hover:bg-cyan-500/40 transition-all -z-10" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <span className="text-sm font-bold text-white tracking-tight whitespace-nowrap">
                  Ephemeral Vault
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 whitespace-nowrap flex-shrink-0">
                  AES-256
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium truncate">
                Self-Destructing Secrets
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Engine Status Pill */}
        <div
          onClick={() => handleNavClick('security')}
          title="System Status: Health & Sweeper Active"
          className="mt-3.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 cursor-pointer text-xs text-slate-300 hover:border-cyan-500/30 hover:bg-slate-900 transition-all"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                healthStatus === 'online' ? 'bg-emerald-400 animate-pulse shadow-glow-green' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-[10px] tracking-wide text-slate-300 font-medium">
              {healthStatus === 'online' ? 'VAULT ACTIVE' : 'CONNECTING...'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/80">15s Sweeper</span>
        </div>
      </div>

      {/* 2. Primary CTA: Create Secret Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => handleNavClick('create')}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs tracking-wide shadow-glow-cyan transition-all flex items-center justify-between group ${
            currentView === 'create'
              ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-black'
              : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-sky-400 text-slate-950'
          }`}
        >
          <span className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Create Secret</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-950/70 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 3. Navigation Links (Grouped & Spacious) */}
      <div className="flex-1 px-3 py-2 overflow-y-auto space-y-5 custom-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              {group.title}
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all group text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-300 font-bold border-l-2 border-cyan-400 shadow-[inset_0_1px_0_0_rgba(6,182,212,0.2)]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                        isActive
                          ? 'bg-cyan-500/25 text-cyan-300 shadow-glow-cyan'
                          : 'bg-slate-800/60 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="truncate leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate font-normal leading-tight mt-0.5">
                        {item.desc}
                      </div>
                    </div>

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 shadow-glow-cyan" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Footer & User Session Card */}
      <div className="p-3.5 border-t border-cyan-500/15 bg-slate-950/60 space-y-2">
        {user ? (
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between gap-2">
            <div
              onClick={() => handleNavClick('settings')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 group"
              title="Open Account Settings"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-purple-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs flex-shrink-0 group-hover:border-cyan-400 transition-colors">
                <UserIcon className="w-4 h-4 text-cyan-400" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleNavClick('settings')}
                title="Account Settings"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={async () => {
                  await logout();
                  handleNavClick('login');
                }}
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavClick('login')}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-white transition-colors text-center"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavClick('signup')}
              className="py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold text-cyan-300 transition-colors text-center shadow-glow-cyan"
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="text-[10px] font-mono text-slate-400 text-center tracking-tight flex items-center justify-center gap-1.5 pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Hardware AES-256-GCM • Zero Plaintext</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent Fixed Left Bar) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 xl:w-72 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-in from left with overlay backdrop) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop blur overlay */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
          />

          {/* Drawer container */}
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
