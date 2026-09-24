import React from 'react';
import { ShieldCheck, Database, Bot, Flame, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const FeatureCards: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'AES-256-GCM Encryption',
      tag: 'HARDWARE AUTHENTICATED',
      desc: 'Symmetric Galois/Counter Mode encryption with unique 12-byte random IVs and 16-byte authentication tags for tamper detection.',
      glow: 'hover:border-cyan-500/40 hover:shadow-glow-cyan',
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      icon: Database,
      title: 'Zero Plaintext Storage',
      tag: 'CONFIDENTIAL STORAGE',
      desc: 'Plaintext secrets are never written to disk, SQLite, logs, or persistent browser caches. Master key is loaded strictly from environment.',
      glow: 'hover:border-purple-500/40 hover:shadow-glow-purple',
      iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: Bot,
      title: 'Link-Preview Scraper Shield',
      tag: 'ANTI-BOT PREVIEWS',
      desc: 'Automated crawlers from Slack, Discord, Facebook, and WhatsApp cannot prematurely reveal or burn your self-destructing links.',
      glow: 'hover:border-sky-500/40 hover:shadow-glow-cyan',
      iconColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      icon: Flame,
      title: 'One-Time Atomic Burn',
      tag: 'SAFE DESTRUCTION',
      desc: 'Opening the landing page is safe. Only an explicit user confirmation triggers the POST burn endpoint, physically hard-deleting the row.',
      glow: 'hover:border-rose-500/40 hover:shadow-glow-danger',
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      icon: Clock,
      title: 'TTL Sweeper Daemon',
      tag: 'AUTOMATIC EXPIRATION',
      desc: 'A background worker periodically scans SQLite and hard-deletes expired unread secrets. Timers are enforced strictly by the backend.',
      glow: 'hover:border-amber-500/40 hover:shadow-glow-cyan',
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: Zap,
      title: 'Atomic Concurrency Guard',
      tag: 'RACE CONDITION SAFE',
      desc: 'Parallel simultaneous requests cannot read the same one-view secret twice. SQLite transactions guarantee exactly 1 winner and 19 rejections.',
      glow: 'hover:border-emerald-500/40 hover:shadow-glow-green',
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Enterprise Security Architecture
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Built for Zero-Trust Ephemeral Sharing
        </h2>
        <p className="mt-4 text-slate-400 text-base leading-relaxed">
          Every layer of the vault is designed around forward-secrecy, authenticated encryption, and deterministic row obliteration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className={`p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 transition-all duration-300 group flex flex-col justify-between ${item.glow}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl border ${item.iconColor} transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
