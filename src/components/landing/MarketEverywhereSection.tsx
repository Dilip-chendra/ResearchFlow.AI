import React from 'react';

export const MarketEverywhereSection: React.FC = () => {
  return (
    <section id="problem" className="relative py-[clamp(4.5rem,10vh,8rem)] px-5 sm:px-10 md:px-12 max-w-5xl mx-auto w-full space-y-24 sm:space-y-32">
      {/* 02. The Market is Everywhere */}
      <div className="space-y-8 sm:space-y-10">
        <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-[#9CCBFF]/70">
          02 &mdash; THE LANDSCAPE
        </div>

        <h2 className="text-[clamp(1.85rem,5vw,3.75rem)] font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-[1.15]">
          The market is everywhere.
        </h2>

        {/* Sequential Words Stream with Fluid Sizing */}
        <div className="flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-2.5 sm:gap-y-3 text-base sm:text-2xl md:text-3xl font-light text-[#A8AFBA]">
          <span className="text-[#F3F5F7]">Competitors.</span>
          <span className="text-[#C7CED8]">Pricing.</span>
          <span className="text-[#A8AFBA]">Features.</span>
          <span className="text-[#9CCBFF]">Positioning.</span>
          <span className="text-[#A8AFBA]">Messaging.</span>
          <span className="text-[#727A86]">Launches.</span>
        </div>

        <p className="text-lg sm:text-2xl font-serif-editorial italic text-[#9CCBFF] max-w-xl leading-relaxed">
          The signal is buried inside it.
        </p>
      </div>

      {/* 03. The Real Problem */}
      <div className="space-y-6 sm:space-y-8 pt-8 border-t border-[#727A86]/20 max-w-3xl">
        <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-[#727A86]">
          03 &mdash; THE RESEARCH BOTTLENECK
        </div>

        <h3 className="text-xl sm:text-3xl md:text-4xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-snug">
          Research breaks when information multiplies.
        </h3>

        <div className="space-y-5 text-sm sm:text-base text-[#A8AFBA] leading-relaxed">
          <p>
            Strategy teams manually jump between competitor websites, pricing tables, product documentation, customer search queries, notes, and disconnected spreadsheets.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 py-2 text-xs font-mono text-[#727A86]">
            <div className="border border-[#727A86]/20 px-3 py-2 rounded-lg bg-[#07090C]/50">Competitor Websites</div>
            <div className="border border-[#727A86]/20 px-3 py-2 rounded-lg bg-[#07090C]/50">Tiered Pricing Tables</div>
            <div className="border border-[#727A86]/20 px-3 py-2 rounded-lg bg-[#07090C]/50">Product Release Logs</div>
            <div className="border border-[#727A86]/20 px-3 py-2 rounded-lg bg-[#07090C]/50">Search Index Queries</div>
            <div className="border border-[#727A86]/20 px-3 py-2 rounded-lg bg-[#07090C]/50">Field Notes & Transcripts</div>
            <div className="border border-[#727A86]/20 px-3 py-2 rounded-lg bg-[#07090C]/50">Static Spreadsheets</div>
          </div>
          <p className="text-[#F3F5F7] font-normal pt-1">
            The result is slow research, inconsistent evidence, and high-stakes decisions built on stale information.
          </p>
        </div>
      </div>
    </section>
  );
};
