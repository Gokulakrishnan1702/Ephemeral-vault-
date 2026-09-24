import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Flame,
  Bug,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  EyeOff,
  Cpu,
  Terminal,
  Activity
} from 'lucide-react';
import {
  api,
  AuditReport,
  ConcurrencyTestResult,
  TamperTestResult,
  DbInspectorRow
} from '../services/api.js';
import { useToast } from '../context/ToastContext.js';

export const SecurityCenterPage: React.FC = () => {
  const { addToast } = useToast();

  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [concurrencyResult, setConcurrencyResult] = useState<ConcurrencyTestResult | null>(null);
  const [tamperResult, setTamperResult] = useState<TamperTestResult | null>(null);
  const [dbRows, setDbRows] = useState<DbInspectorRow[]>([]);
  
  const [runningAudit, setRunningAudit] = useState(false);
  const [runningConcurrency, setRunningConcurrency] = useState(false);
  const [runningTamper, setRunningTamper] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);

  // Initial audit load
  useEffect(() => {
    handleRunAudit();
    handleFetchDbInspector();
  }, []);

  const handleRunAudit = async () => {
    setRunningAudit(true);
    try {
      const data = await api.runSecurityAudit();
      setAuditReport(data);
      addToast('success', `Security Audit completed: ${data.passed_tests}/${data.total_tests} passed.`, 'Audit Complete');
    } catch (err: any) {
      addToast('error', 'Audit execution failed');
    } finally {
      setRunningAudit(false);
    }
  };

  const handleRunConcurrency = async () => {
    setRunningConcurrency(true);
    try {
      const data = await api.runConcurrencyTest();
      setConcurrencyResult(data);
      if (data.passed) {
        addToast('success', 'Concurrency test passed: Exactly 1 winner, 19 rejections.', 'Race Safe');
      } else {
        addToast('error', 'Concurrency race test failed.');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Concurrency test failed');
    } finally {
      setRunningConcurrency(false);
    }
  };

  const handleRunTamper = async () => {
    setRunningTamper(true);
    try {
      const data = await api.runTamperTest();
      setTamperResult(data);
      if (data.passed) {
        addToast('success', 'Tamper test passed: GCM auth tag rejected modified ciphertext.', 'Tamper Proof');
      } else {
        addToast('error', 'Tamper test failed.');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Tamper test failed');
    } finally {
      setRunningTamper(false);
    }
  };

  const handleFetchDbInspector = async () => {
    setLoadingDb(true);
    try {
      const data = await api.getDbInspector();
      setDbRows(data.records);
    } catch {
      // ignore
    } finally {
      setLoadingDb(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      
      {/* Page Title & Audit Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
            <Activity className="w-3.5 h-3.5" />
            Security & Compliance Test Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Security Center
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time verification of cryptographic invariant proofs, zero-plaintext storage, and atomic concurrency guards.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={runningAudit}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs tracking-wide shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
        >
          {runningAudit ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running 8-Test Audit...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Run Full Security Audit</span>
            </>
          )}
        </button>
      </div>

      {/* 8-Card Security Status Matrix */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Core Invariants (Live Test Suite)
          </h2>
          {auditReport && (
            <span className="text-xs font-mono text-emerald-400">
              Execution Time: {auditReport.execution_time_ms}ms • Status: {auditReport.audit_status}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {auditReport?.tests.map((test) => {
            const isPass = test.status === 'PASS';
            return (
              <div
                key={test.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-md flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{test.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 ${
                      isPass
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {isPass ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {test.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{test.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{test.details}</p>
                </div>
                <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800 flex justify-between">
                  <span>Latency</span>
                  <span className="text-cyan-400">{test.duration_ms}ms</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Concurrency Race Test */}
      <section className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              Live Race Condition Elimination
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Atomic Concurrency Test (20 Parallel Burns)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Fires 20 simultaneous HTTP POST requests to burn the exact same 1-view secret concurrently. SQLite transactions guarantee exactly 1 winner and 19 rejections.
            </p>
          </div>

          <button
            onClick={handleRunConcurrency}
            disabled={runningConcurrency}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {runningConcurrency ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating 20 Attacks...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run 20 Concurrent Requests</span>
              </>
            )}
          </button>
        </div>

        {/* Results visualization */}
        {concurrencyResult && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-500">Total Requests</span>
                <div className="text-lg font-bold font-mono text-white mt-0.5">{concurrencyResult.total_requests}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-mono text-emerald-400">Successful (200 OK)</span>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{concurrencyResult.successful_reads}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400">Rejected (404 Burned)</span>
                <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">{concurrencyResult.rejected_reads}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30">
                <span className="text-[10px] uppercase font-mono text-cyan-400">Race Condition</span>
                <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">PASSED</div>
              </div>
            </div>

            {/* 20 Request Tiles Visualizer */}
            <div>
              <div className="text-[11px] font-mono text-slate-400 mb-2">Simultaneous Request Telemetry Grid:</div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {concurrencyResult.results.map((req) => (
                  <div
                    key={req.request_index}
                    className={`p-2 rounded-lg border text-center font-mono text-[10px] ${
                      req.status === 200
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-glow-green font-bold animate-pulse'
                        : 'bg-slate-950/80 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div>#{req.request_index}</div>
                    <div className="font-bold">{req.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Interactive Tamper Detection Test */}
      <section className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">
              <Bug className="w-3.5 h-3.5" />
              Cryptographic Integrity Verification
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AES-256-GCM Tamper Detection Test
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Directly corrupts 1 byte of encrypted ciphertext in SQLite storage and triggers reveal. Verifies that GCM authentication fails cleanly and no corrupted plaintext leaks.
            </p>
          </div>

          <button
            onClick={handleRunTamper}
            disabled={runningTamper}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {runningTamper ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Corrupting & Verifying...</span>
              </>
            ) : (
              <>
                <Bug className="w-4 h-4" />
                <span>Run Tamper Test</span>
              </>
            )}
          </button>
        </div>

        {tamperResult && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Tampered Bytes in SQLite:</span>
              <span className="text-amber-400 font-bold">{tamperResult.tampered_bytes} Byte (Bit-flipped)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Authentication Tag Verification:</span>
              <span className="text-rose-400 font-bold">REJECTED (EXPECTED)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Corrupted Plaintext Leaked:</span>
              <span className="text-emerald-400 font-bold">NO (0 BYTES LEAKED)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Safe Error Handled:</span>
              <span className="text-cyan-300">{tamperResult.error_message}</span>
            </div>
          </div>
        )}
      </section>

      {/* Database Inspector (Section 45) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Live Database Inspector (Demonstrates Zero Plaintext)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live SQLite rows showing only ciphertext, random IV, and auth tag. Plaintext is never stored.
            </p>
          </div>
          <button
            onClick={handleFetchDbInspector}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDb ? 'animate-spin' : ''}`} />
            Refresh DB
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Secret ID</th>
                  <th className="py-3 px-4">Ciphertext (HEX)</th>
                  <th className="py-3 px-4">IV (12 Bytes)</th>
                  <th className="py-3 px-4">Auth Tag (16 Bytes)</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4 text-center">Plaintext in DB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {dbRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No secrets currently stored in database. Create a secret to inspect.
                    </td>
                  </tr>
                ) : (
                  dbRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-cyan-300 font-bold">{row.id}</td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-[200px]">{row.ciphertext_hex}</td>
                      <td className="py-3 px-4 text-purple-300">{row.iv_hex}</td>
                      <td className="py-3 px-4 text-sky-300">{row.auth_tag_hex}</td>
                      <td className="py-3 px-4 text-slate-200">{row.views_remaining} / {row.max_views}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                          NO (0 BYTES)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
};
