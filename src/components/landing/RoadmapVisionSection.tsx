import React from 'react';
import { Compass, Sparkles, Send, Share2, Layers, Cpu, ArrowRight } from 'lucide-react';

export const RoadmapVisionSection: React.FC = () => {
  const roadmapItems = [
    {
      quarter: 'Q4 2026',
      title: 'Direct Marketing API Publishing',
      desc: 'One-click export and scheduling directly into LinkedIn Campaign Manager, HubSpot, and Notion.',
      status: 'In Development',
    },
    {
      quarter: 'Q4 2026',
      title: 'Continuous Webhook Alerts',
      desc: 'Real-time delta notifications sent directly to Slack and Discord channels when competitors alter pricing.',
      status: 'Planned',
    },
    {
      quarter: 'Q1 2027',
      title: 'Vector Semantic Evidence Search',
      desc: 'Semantic vector search across thousands of historical claims and competitor archives.',
      status: 'Planned',
    },
    {
      quarter: 'Q1 2027',
      title: 'Enterprise Single Sign-On (SSO)',
      desc: 'SAML / Okta integration and granular role-based access controls for enterprise market intelligence teams.',
      status: 'Planned',
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#07090E]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">
            Long-Term Vision
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Research is just the beginning.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            We are building the autonomous intelligence and execution layer for high-growth tech companies — connecting external market data with internal execution workflows.
          </p>
        </div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {roadmapItems.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-400">
                    {item.quarter}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {item.status}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{item.desc}</p>
              </div>
              <div className="pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono">
                ROADMAP MODULE
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
