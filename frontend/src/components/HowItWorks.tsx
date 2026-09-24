import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Lock, Share2, Flame } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Create',
      desc: 'Enter your confidential credentials, database passwords, or certificates. Choose TTL expiration and view limits.',
      icon: Edit3,
      accent: 'from-cyan-500 to-sky-500',
    },
    {
      num: '02',
      title: 'Encrypt',
      desc: 'The cryptographic engine generates a 96-bit random IV and encrypts payload via AES-256-GCM. Only ciphertext hits SQLite.',
      icon: Lock,
      accent: 'from-sky-500 to-purple-500',
    },
    {
      num: '03',
      title: 'Share',
      desc: 'Receive a secure, non-enumerable link. Link previews from Slack, WhatsApp, and Discord are safely neutralized.',
      icon: Share2,
      accent: 'from-purple-500 to-indigo-500',
    },
    {
      num: '04',
      title: 'Reveal & Destroy',
      desc: 'The recipient clicks the explicit Reveal button. The row is decrypted once and physically erased from SQLite storage.',
      icon: Flame,
      accent: 'from-indigo-500 to-rose-500',
    },
  ];

  return (
    <section className="py-20 border-y border-slate-800/80 bg-[#060918]/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
            Deterministic Lifecycle
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How The Safe Burn Flow Works
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            From plaintext ingestion to permanent cryptographic destruction in four safe phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative p-6 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md flex flex-col justify-between group hover:border-cyan-500/40 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black font-mono text-slate-700 group-hover:text-cyan-400/40 transition-colors">
                      {step.num}
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-cyan-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className={`mt-6 h-1 w-full rounded-full bg-gradient-to-r ${step.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
