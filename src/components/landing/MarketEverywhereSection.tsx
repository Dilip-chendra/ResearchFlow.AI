import React from 'react';

export const MarketEverywhereSection: React.FC = () => {
  return (
    <section id="problem" className="relative py-[clamp(4.5rem,10vh,8rem)] px-5 sm:px-10 md:px-12 max-w-5xl mx-auto w-full space-y-24 sm:space-y-32">
      {/* 02. The Market is Everywhere */}
      <div className="space-y-8 sm:space-y-10">
        <div className="text-[11px] sm:text-xs font-subheading tracking-[0.24em] uppercase text-[#F5D77F] font-bold drop-shadow-sm">
          02 &mdash; THE LANDSCAPE
        </div>

        <h2 className="text-[clamp(2.4rem,6.5vw,4.5rem)] font-display font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-[0_6px_36px_rgba(0,0,0,0.85)]">
          The market is everywhere.
        </h2>

        {/* Sequential Words Stream with Fluid Sizing */}
        <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 text-lg sm:text-2xl md:text-3xl font-display font-medium text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          <span className="text-white">Competitors.</span>
          <span className="text-white/90">Pricing.</span>
          <span className="text-white/80">Features.</span>
          <span className="text-gold-gradient font-bold drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]">Positioning.</span>
          <span className="text-white/80">Messaging.</span>
          <span className="text-white/60">Launches.</span>
        </div>

        <p className="text-xl sm:text-3xl font-luxury-serif italic font-medium text-[#F5D77F] max-w-xl leading-relaxed drop-shadow-[0_2px_16px_rgba(212,175,55,0.4)]">
          The signal is buried inside it.
        </p>
      </div>

      {/* 03. The Real Problem */}
      <div className="space-y-6 sm:space-y-8 pt-10 border-t border-amber-400/20 max-w-3xl">
        <div className="text-[11px] sm:text-xs font-subheading tracking-[0.24em] uppercase text-[#F5D77F]/90 font-bold drop-shadow-sm">
          03 &mdash; THE RESEARCH BOTTLENECK
        </div>

        <h3 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          Research breaks when information multiplies.
        </h3>

        <div className="space-y-6 text-base sm:text-lg text-white/85 leading-relaxed font-editorial drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          <p>
            Strategy teams manually jump between competitor websites, pricing tables, product documentation, customer search queries, notes, and disconnected spreadsheets.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 py-2 text-xs font-mono">
            <div className="border border-amber-400/20 px-4 py-3 rounded-xl bg-black/25 text-white shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all">Competitor Websites</div>
            <div className="border border-amber-400/20 px-4 py-3 rounded-xl bg-black/25 text-white shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all">Tiered Pricing Tables</div>
            <div className="border border-amber-400/20 px-4 py-3 rounded-xl bg-black/25 text-white shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all">Product Release Logs</div>
            <div className="border border-amber-400/20 px-4 py-3 rounded-xl bg-black/25 text-white shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all">Search Index Queries</div>
            <div className="border border-amber-400/20 px-4 py-3 rounded-xl bg-black/25 text-white shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all">Field Notes & Transcripts</div>
            <div className="border border-amber-400/20 px-4 py-3 rounded-xl bg-black/25 text-white shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all">Static Spreadsheets</div>
          </div>
          <p className="text-white font-medium pt-1 drop-shadow-md">
            The result is slow research, inconsistent evidence, and high-stakes decisions built on stale information.
          </p>
        </div>
      </div>
    </section>
  );
};
