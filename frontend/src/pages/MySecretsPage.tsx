import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ExternalLink,
  Copy,
  Trash2,
  Info,
  Clock,
  Flame,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Database,
  Bot
} from 'lucide-react';
import { api, SecretMetadata, SecurityStats } from '../services/api.js';
import { SecretDetailsModal } from './SecretDetailsModal.js';
import { useToast } from '../context/ToastContext.js';

interface MySecretsPageProps {
  onNavigateToCreate: () => void;
  onNavigateToView: (id: string) => void;
}

export const MySecretsPage: React.FC<MySecretsPageProps> = ({
  onNavigateToCreate,
  onNavigateToView,
}) => {
  const { addToast } = useToast();

  const [secrets, setSecrets] = useState<SecretMetadata[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSecret, setSelectedSecret] = useState<SecretMetadata | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [secretsList, statsData] = await Promise.all([
        api.listSecrets(),
        api.getSecurityStats(),
      ]);
      setSecrets(secretsList);
      setStats(statsData);
    } catch (err: any) {
      addToast('error', 'Failed to refresh secrets list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyLink = async (id: string) => {
    const url = `${window.location.origin}/view/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      addToast('success', 'Safe share link copied to clipboard!');
    } catch {
      addToast('error', 'Failed to copy URL');
    }
  };

  const handleManualDestroy = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently hard-delete this secret from SQLite now?')) {
      return;
    }

    try {
      await api.deleteSecret(id);
      addToast('success', `Secret ${id} permanently wiped from database.`, 'Destroyed');
      fetchData();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to destroy secret');
    }
  };

  // Filtered secrets list
  const filtered = secrets.filter((s) => {
    const matchesQuery = s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.secret_type.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-cyan-400" />
            <span>My Secrets Dashboard</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time metadata monitor. Plaintext is never stored in database or memory caches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onNavigateToCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-glow-cyan transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Secret</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Total Secrets</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{stats?.total_created ?? 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Active Now</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats?.active_secrets ?? 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Total Reveals</div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{stats?.total_reveals ?? 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">TTL Purged</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{stats?.expired_secrets ?? 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Burned & Wiped</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{stats?.destroyed_secrets ?? 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Crawlers Deflected</div>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{stats?.blocked_crawlers ?? 0}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Secret ID or Type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'Active', 'Expiring Soon', 'Expired', 'Destroyed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Secrets Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Secret ID</th>
                <th className="py-3.5 px-4 font-semibold">Classification</th>
                <th className="py-3.5 px-4 font-semibold">Created</th>
                <th className="py-3.5 px-4 font-semibold">Expires</th>
                <th className="py-3.5 px-4 font-semibold">Remaining Views</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs font-mono">
                    {loading ? 'Querying vault database...' : 'No secrets found matching query.'}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const statusColors: Record<string, string> = {
                    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    'Expiring Soon': 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse',
                    Expired: 'bg-slate-800 text-slate-400 border-slate-700',
                    Destroyed: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                  };

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        {s.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">
                        {s.secret_type}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(s.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        {s.views_remaining} / {s.max_views}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${statusColors[s.status || 'Active'] || 'border-slate-700'}`}>
                          {s.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyLink(s.id)}
                            title="Copy Safe Link"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigateToView(s.id)}
                            title="Open Safe Landing Page"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedSecret(s)}
                            title="Cryptographic Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition-colors"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleManualDestroy(s.id)}
                            title="Permanently Destroy From SQLite"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secret Details Modal */}
      <SecretDetailsModal
        secret={selectedSecret}
        onClose={() => setSelectedSecret(null)}
      />

    </div>
  );
};
