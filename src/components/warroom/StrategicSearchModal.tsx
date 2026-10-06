import React, { useState, useEffect } from 'react';
import { X, Search, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface StrategicSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (type: string, id: string) => void;
}

export const StrategicSearchModal: React.FC<StrategicSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({
    competitors: [],
    moves: [],
    gaps: [],
    opportunities: [],
    threats: [],
    recommendations: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ competitors: [], moves: [], gaps: [], opportunities: [], threats: [], recommendations: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.searchWarRoom(query.trim());
        if (res.results) {
          setResults(res.results);
        }
      } catch {
        // Ignored
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.competitors.length +
    results.moves.length +
    results.gaps.length +
    results.opportunities.length +
    results.threats.length +
    results.recommendations.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-zinc-200 flex items-center gap-3 bg-zinc-50/50">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search market model by competitor, capability gap, move, or opportunity..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none text-zinc-900 placeholder:text-zinc-400"
          />
          {isSearching && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />}
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {!query.trim() ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              Type to search across all verified competitor profiles, pricing moves, roadmap gaps, and strategic recommendations.
            </div>
          ) : totalResults === 0 && !isSearching ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No matching strategic entities found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Competitors */}
              {results.competitors.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Competitors ({results.competitors.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.competitors.map((c: any) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectItem?.('COMPETITOR', c.id);
                          onClose();
                        }}
                        className="p-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-zinc-900">{c.name}</div>
                          <div className="text-[11px] text-zinc-500">{c.positioningSummary}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">
                          {c.tier}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Moves */}
              {results.moves.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Competitor Moves ({results.moves.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.moves.map((m: any) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-zinc-900">{m.competitorName}: {m.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                            {m.moveType}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 line-clamp-1">{m.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Gaps */}
              {results.gaps.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Product Gaps ({results.gaps.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.gaps.map((g: any) => (
                      <div
                        key={g.id}
                        className="p-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-zinc-900">{g.featureName}</div>
                          <div className="text-[11px] text-zinc-500">{g.classification} · Action: {g.recommendationAction}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                          Score: {g.buildPriorityScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {results.opportunities.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Market Opportunities ({results.opportunities.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.opportunities.map((o: any) => (
                      <div
                        key={o.id}
                        className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/30 text-xs transition-colors"
                      >
                        <div className="font-semibold text-emerald-950">{o.title}</div>
                        <div className="text-[11px] text-emerald-800 line-clamp-1">{o.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Search grounded in real workspace evidence</span>
          <div className="flex items-center gap-1 text-zinc-500 font-mono">
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
