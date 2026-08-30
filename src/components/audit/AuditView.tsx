import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { AuditEvent } from '../../types';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileCode,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  FileText,
  Sliders,
  Send,
  Database,
  Link,
  Tag
} from 'lucide-react';

export const AuditView: React.FC = () => {
  const { addToast } = useWorkspace();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadAudit = async () => {
    try {
      setLoading(true);
      const data = await api.getActivity(50);
      setEvents(data);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const getActionIcon = (action?: string) => {
    const act = (action || '').toLowerCase();
    if (act.includes('create') || act.includes('seed')) return Sparkles;
    if (act.includes('approve') || act.includes('passed')) return CheckCircle2;
    if (act.includes('conflict') || act.includes('reject') || act.includes('fail')) return AlertTriangle;
    if (act.includes('fetch') || act.includes('crawl')) return Link;
    if (act.includes('extract') || act.includes('parse')) return FileText;
    if (act.includes('campaign') || act.includes('brief')) return Send;
    if (act.includes('task')) return Sliders;
    if (act.includes('workspace')) return Layers;
    if (act.includes('db') || act.includes('storage')) return Database;
    return Zap;
  };

  const getActionColor = (action?: string) => {
    const act = (action || '').toLowerCase();
    if (act.includes('approve') || act.includes('passed') || act.includes('completed')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (act.includes('conflict') || act.includes('warn')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (act.includes('reject') || act.includes('fail') || act.includes('error')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  const filtered = events.filter((e) => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (
      !q ||
      (e.action && e.action.toLowerCase().includes(q)) ||
      (e.summary && e.summary.toLowerCase().includes(q)) ||
      (e.entityType && e.entityType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Audit Trail & Telemetry</h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            Verified provenance log of pipeline execution, AI synthesis prompts, conflict resolutions, and human reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAudit}
            className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors shadow-2xs"
            title="Refresh audit log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit actions, entities, or event summaries..."
            className="text-xs p-1.5 border border-zinc-200 rounded-lg w-full outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 text-xs">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
          <span>Loading telemetry events...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-500 text-xs">
          No audit events recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((evt) => {
            const isExpanded = expandedId === evt.id;
            const ActionIcon = getActionIcon(evt.action);
            const colorClass = getActionColor(evt.action);

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden text-xs transition-all hover:border-zinc-300"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl border shrink-0 ${colorClass}`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-zinc-900">
                          {(evt.action || 'EVENT').replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200 uppercase flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-zinc-500" />
                          <span>{evt.entityType}</span>
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-zinc-700 mt-1 leading-snug">{evt.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FileCode className="w-3 h-3" />
                        <span>{Object.keys(evt.metadata).length} props</span>
                      </span>
                    )}
                    <div className="p-1 rounded-md text-zinc-400 hover:text-zinc-600">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Formatted Metadata Showcase - No Raw JSON */}
                {isExpanded && evt.metadata && Object.keys(evt.metadata).length > 0 && (
                  <div className="p-4 bg-zinc-50/80 border-t border-zinc-100 space-y-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Event Execution Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {Object.entries(evt.metadata).map(([key, val]) => {
                        let displayVal = '';
                        let isLink = false;
                        if (typeof val === 'object' && val !== null) {
                          displayVal = Array.isArray(val) ? val.join(', ') : JSON.stringify(val);
                        } else {
                          displayVal = String(val);
                          isLink = displayVal.startsWith('http://') || displayVal.startsWith('https://');
                        }

                        return (
                          <div
                            key={key}
                            className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs space-y-1"
                          >
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            {isLink ? (
                              <a
                                href={displayVal}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px] font-mono truncate"
                              >
                                <span className="truncate">{displayVal}</span>
                                <Link className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-xs font-semibold text-zinc-800 break-words block">
                                {displayVal || '—'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
