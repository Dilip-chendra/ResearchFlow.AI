import React, { useState, useEffect } from 'react';
import { X, Network, Filter, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { MarketKnowledgeGraph, MarketGraphNode } from '../../types';

interface MarketGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketGraphModal: React.FC<MarketGraphModalProps> = ({ isOpen, onClose }) => {
  const [graphData, setGraphData] = useState<MarketKnowledgeGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<MarketGraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadGraph();
    }
  }, [isOpen]);

  const loadGraph = async () => {
    try {
      setLoading(true);
      const res = await api.getMarketGraph();
      if (res.graph) {
        setGraphData(res.graph);
        if (res.graph.nodes.length > 0) {
          setSelectedNode(res.graph.nodes[0]);
        }
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const nodeColorMap: Record<string, { bg: string; text: string; border: string }> = {
    OUR_PRODUCT: { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-700' },
    COMPETITOR: { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300' },
    MOVE: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
    CAPABILITY: { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300' },
    OPPORTUNITY: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
    THREAT: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
  };

  const filteredNodes = (graphData?.nodes || []).filter(n => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900">Market Knowledge Graph</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                  EVIDENCE-GROUNDED GRAPH
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Visualizing interconnected entities: Competitors, Moves, Gaps, Customer Signals, and Opportunities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-transparent text-xs text-zinc-700 focus:outline-none pr-2"
              >
                <option value="ALL">All Nodes ({graphData?.nodes.length || 0})</option>
                <option value="COMPETITOR">Competitors</option>
                <option value="MOVE">Moves</option>
                <option value="CAPABILITY">Capabilities / Gaps</option>
                <option value="OPPORTUNITY">Opportunities</option>
                <option value="THREAT">Threats</option>
              </select>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Node Grid View */}
          <div className="md:col-span-8 p-6 overflow-y-auto bg-zinc-50/40 border-r border-zinc-200">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-zinc-400">
                Loading Knowledge Graph...
              </div>
            ) : filteredNodes.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-zinc-400">
                No graph entities found matching filter.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Node Groups */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
                    Active Graph Entities ({filteredNodes.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredNodes.map(node => {
                      const colors = nodeColorMap[node.type] || {
                        bg: 'bg-zinc-100',
                        text: 'text-zinc-800',
                        border: 'border-zinc-300',
                      };
                      const isSelected = selectedNode?.id === node.id;
                      return (
                        <button
                          key={node.id}
                          onClick={() => setSelectedNode(node)}
                          className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-indigo-500 shadow-md bg-white'
                              : 'bg-white hover:border-zinc-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}
                            >
                              {node.type.replace('_', ' ')}
                            </span>
                            {node.category && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {node.category}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-xs text-zinc-900 mt-1 truncate">
                            {node.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Graph Link Relationships */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
                    Knowledge Graph Relationships ({graphData?.links.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {(graphData?.links || []).map((link, idx) => {
                      const sourceNode = graphData?.nodes.find(n => n.id === link.source);
                      const targetNode = graphData?.nodes.find(n => n.id === link.target);
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-zinc-200 bg-white text-xs flex items-center justify-between"
                        >
                          <span className="font-semibold text-zinc-800 truncate max-w-[35%]">
                            {sourceNode?.label || link.source}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold border border-zinc-200">
                            {link.relationship.replace('_', ' ')}
                          </span>
                          <span className="font-semibold text-zinc-800 truncate max-w-[35%] text-right">
                            {targetNode?.label || link.target}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Node Inspector Drawer */}
          <div className="md:col-span-4 p-6 overflow-y-auto bg-white space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Entity Inspector
            </h4>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
                    {selectedNode.type}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 mb-2">
                    {selectedNode.label}
                  </h3>
                  {selectedNode.significance && (
                    <div className="text-xs text-zinc-600 mb-1">
                      Significance:{' '}
                      <span className="font-semibold text-zinc-900">
                        {selectedNode.significance}
                      </span>
                    </div>
                  )}
                  {selectedNode.category && (
                    <div className="text-xs text-zinc-600">
                      Category:{' '}
                      <span className="font-semibold text-zinc-900">
                        {selectedNode.category}
                      </span>
                    </div>
                  )}
                </div>

                {selectedNode.data && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Grounding Payload
                    </span>
                    <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-200 text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed">
                      {JSON.stringify(selectedNode.data, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-2 text-xs text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Every node in the ResearchFlow Market Graph maps back to verified URLs, timestamped claims, and company context.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-400">Select any node to view entity metadata.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
