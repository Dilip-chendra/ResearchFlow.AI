import React from 'react';
import { ShieldCheck, Lock, Key, FileCode, Users, Database } from 'lucide-react';

export const SecurityTrustSection: React.FC = () => {
  const securityPillars = [
    {
      title: 'Strict Multi-Tenant Isolation',
      desc: 'Workspace boundaries are enforced on every server-side database operation. User A can never query or access User B private research.',
      icon: ShieldCheck,
    },
    {
      title: 'Cryptographic Auth & Salted Hashing',
      desc: 'PBKDF2 with 100,000 iterations of SHA-512 and random 16-byte salts. Session tokens are 32-byte cryptographically secure strings.',
      icon: Lock,
    },
    {
      title: 'Prompt Injection Defense',
      desc: 'Untrusted competitor web text is quarantined in strict XML wrappers with system directives preventing prompt jailbreaks.',
      icon: FileCode,
    },
    {
      title: 'Immutable Audit Trail',
      desc: 'Every research job creation, evidence extraction, conflict resolution, and human campaign approval is timestamped and recorded.',
      icon: Database,
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#080A10]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
            Security & Privacy Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Workspace isolation is a security boundary.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Market research, competitor positioning teardowns, and GTM briefs are critical intellectual property. We protect your research with zero cross-tenant leakage.
          </p>
        </div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {securityPillars.map((p, idx) => {
            const Icon = p.icon;

            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{p.title}</h3>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
