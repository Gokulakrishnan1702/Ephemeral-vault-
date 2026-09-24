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
  Menu,
  X,
  Activity,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>('checking');

  useEffect(() => {
    api.getHealth()
      .then((h) => {
        if (h.status === 'ok') setHealthStatus('online');
        else setHealthStatus('degraded');
      })
      .catch(() => setHealthStatus('offline'));
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Shield },
    { id: 'create', label: 'Create Secret', icon: PlusCircle, highlight: true },
    { id: 'my-secrets', label: 'My Secrets', icon: KeyRound },
    { id: 'security', label: 'Security Center', icon: Activity },
    { id: 'cli', label: 'CLI Helper', icon: Terminal },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
    { id: 'architecture', label: 'Architecture', icon: Cpu },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#050711]/85 border-b border-cyan-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-purple-600 p-[1.5px] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#070b19] rounded-[10px] flex items-center justify-center">
                <Lock className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
              <div className="absolute -inset-1 bg-cyan-500/20 rounded-xl blur group-hover:bg-cyan-500/40 transition-all -z-10" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Ephemeral Vault</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  AES-256
                </span>
              </div>
              <div className="text-[10px] text-slate-400 -mt-0.5 tracking-wider uppercase font-medium">
                Self-Destructing Secrets
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan'
                      : item.highlight
                      ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white hover:from-cyan-500 hover:to-sky-500 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Section: System Status & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live Health Badge */}
            <div
              onClick={() => onNavigate('security')}
              title="System Status: Health & TTL Sweeper Active"
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 cursor-pointer text-[11px] text-slate-300 hover:border-cyan-500/40 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${
                healthStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`} />
              <span className="font-mono text-[10px] text-slate-300">
                {healthStatus === 'online' ? 'VAULT ACTIVE' : 'CONNECTING'}
              </span>
            </div>

            {/* Auth Controls */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('settings')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 hover:border-slate-700 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    onNavigate('login');
                  }}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-medium transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#070b19] px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-slate-300">{user.email}</span>
                <button
                  onClick={async () => {
                    await logout();
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-xs text-slate-200"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    onNavigate('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-cyan-600 text-xs text-white"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
