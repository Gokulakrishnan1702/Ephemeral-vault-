import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, ExternalLink, Code, Shield, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext.js';

export const CliHelperPage: React.FC = () => {
  const { addToast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      addToast('success', 'Command copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      addToast('error', 'Failed to copy command');
    }
  };

  const handleDownloadCli = () => {
    const cliScript = `#!/usr/bin/env node
import fs from 'node:fs';
const args = process.argv.slice(2);
let ttl = 3600, views = 1, secretType = 'CLI Secret';
let apiUrl = process.env.VAULT_API_URL || 'http://localhost:3000';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ttl' && args[i+1]) ttl = parseInt(args[++i], 10);
  if (args[i] === '--views' && args[i+1]) views = parseInt(args[++i], 10);
  if (args[i] === '--type' && args[i+1]) secretType = args[++i];
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', async () => {
  if (!input.trim()) { console.error('No secret provided via stdin.'); process.exit(1); }
  const res = await fetch(\`\${apiUrl}/api/secret\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: input.trim(), ttl_seconds: ttl, max_views: views, secret_type: secretType })
  });
  const data = await res.json();
  console.log('✔ Secret Encrypted & Vaulted: ' + data.view_url);
});
`;
    const blob = new Blob([cliScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vault-cli.js';
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'vault-cli.js downloaded.');
  };

  const commands = [
    {
      title: 'Pipe Secret File to Vault',
      desc: 'Encrypt an entire credentials or .env file directly from stdin without shell history leaks.',
      cmd: 'cat .env.production | node cli/vault-cli.js --type ".env File" --ttl 3600',
    },
    {
      title: 'Pipe Password from Terminal',
      desc: 'Send a one-time credential with 5-minute TTL and 1 view allowance.',
      cmd: 'echo "P@ssw0rd998!" | node cli/vault-cli.js --ttl 300 --views 1 --type "Password"',
    },
    {
      title: 'Standard cURL Creation Request',
      desc: 'Integrate into CI/CD pipelines, Ansible playbooks, or GitHub Actions.',
      cmd: `curl -X POST http://localhost:3000/api/secret \\
  -H "Content-Type: application/json" \\
  -d '{"secret":"db_master_key_992","ttl_seconds":3600,"max_views":1,"secret_type":"Database Credential"}'`,
    },
    {
      title: 'Safe Landing Metadata Query (cURL)',
      desc: 'Probes secret expiration and view status WITHOUT burning or decrypting.',
      cmd: 'curl http://localhost:3000/api/secret/<SECRET_ID>/meta',
    },
    {
      title: 'Safe Burn and Decryption (cURL)',
      desc: 'Atomically decrypts and physically erases the secret row from SQLite storage.',
      cmd: `curl -X POST http://localhost:3000/api/secret/<SECRET_ID>/burn \\
  -H "Content-Type: application/json"`,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
            <Terminal className="w-3.5 h-3.5" />
            Developer Tools & Automation
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            CLI Helper & Automation Guide
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Vault secrets from your terminal, standard input pipes, and automated deployment pipelines.
          </p>
        </div>

        <button
          onClick={handleDownloadCli}
          className="px-5 py-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs font-bold transition-all flex items-center gap-2 shadow-glow-cyan shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download vault-cli.js</span>
        </button>
      </div>

      {/* Commands Grid */}
      <div className="space-y-6">
        {commands.map((c, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{c.desc}</p>
              </div>
              <button
                onClick={() => copyToClipboard(c.cmd, idx)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-mono text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-cyan-200 overflow-x-auto whitespace-pre-wrap select-all">
                {c.cmd}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* CLI Flag Reference Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300">
          CLI Options & Argument Reference
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Flag</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Default</th>
                <th className="py-2.5 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-4 text-cyan-300 font-bold">--ttl</td>
                <td className="py-2.5 px-4 text-slate-400">number (sec)</td>
                <td className="py-2.5 px-4 text-slate-400">3600 (1 hour)</td>
                <td className="py-2.5 px-4">Secret lifetime before background sweeper purging.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-cyan-300 font-bold">--views</td>
                <td className="py-2.5 px-4 text-slate-400">number</td>
                <td className="py-2.5 px-4 text-slate-400">1</td>
                <td className="py-2.5 px-4">Max permitted reveal views before automatic physical destruction.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-cyan-300 font-bold">--type</td>
                <td className="py-2.5 px-4 text-slate-400">string</td>
                <td className="py-2.5 px-4 text-slate-400">"CLI Secret"</td>
                <td className="py-2.5 px-4">Classification label (Password, API Key, Token, etc.).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-cyan-300 font-bold">--passphrase</td>
                <td className="py-2.5 px-4 text-slate-400">string</td>
                <td className="py-2.5 px-4 text-slate-400">none</td>
                <td className="py-2.5 px-4">Secondary PBKDF2 passphrase required to decrypt.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-cyan-300 font-bold">--api-url</td>
                <td className="py-2.5 px-4 text-slate-400">URL string</td>
                <td className="py-2.5 px-4 text-slate-400">http://localhost:3000</td>
                <td className="py-2.5 px-4">Target Ephemeral Vault backend API endpoint.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
