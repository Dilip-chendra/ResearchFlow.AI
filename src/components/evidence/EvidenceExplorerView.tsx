import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { Evidence, ResearchCategory, EvidenceType, ConfidenceLevel } from '../../types';
import { EvidenceCard } from '../common/EvidenceCard';
import { exportEvidenceToCSV } from '../../lib/exportUtils';
import { Search, Download, Filter, Database, RefreshCw, FileSpreadsheet, FileJson } from 'lucide-react';

export const EvidenceExplorerView: React.FC = () => {
  const { activeWorkspace, addToast, setSelectedJobId, setActiveView } = useWorkspace();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('ALL');

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const jobs = await api.getResearchJobs();
      const allEvidence: Evidence[] = [];

      for (const j of jobs) {
        const full = await api.getResearchJob(j.id);
        if (full.evidence) {
          allEvidence.push(...full.evidence);
        }
      }
      setEvidence(allEvidence);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, [activeWorkspace?.id]);

  const categories: ResearchCategory[] = [
    'Product',
    'Pricing',
    'Features',
    'Positioning',
    'Audience',
    'Messaging',
    'Call To Action',
    'Differentiators',
    'Pain Points',
    'Potential Gaps',
    'Trust Signals',
  ];

  const filtered = evidence.filter((e) => {
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch =
      !q ||
      (e.claim && e.claim.toLowerCase().includes(q)) ||
      (e.supportingText && e.supportingText.toLowerCase().includes(q)) ||
      (e.sourceTitle && e.sourceTitle.toLowerCase().includes(q)) ||
      (e.sourceUrl && e.sourceUrl.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesType = selectedType === 'ALL' || e.evidenceType === selectedType;
    const matchesConfidence = selectedConfidence === 'ALL' || e.confidence === selectedConfidence;
    return matchesSearch && matchesCategory && matchesType && matchesConfidence;
  });

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidence-export-${activeWorkspace?.id || 'all'}.json`;
    a.click();
    addToast(`Exported ${filtered.length} evidence items to JSON`, 'success');
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      addToast('No evidence items to export', 'warning');
      return;
    }
    exportEvidenceToCSV(filtered, `evidence-export-${activeWorkspace?.id || 'all'}.csv`);
    addToast(`Exported ${filtered.length} evidence items to CSV`, 'success');
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Evidence Base Explorer
          </h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            Verified repository of extracted competitor claims, pricing models, and market facts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadEvidence}
            className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors"
            title="Refresh evidence base"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="btn-export-evidence-csv"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            title="Export filtered evidence to CSV spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            title="Export raw JSON"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified claims, quotation snippets, or source titles..."
            className="text-xs p-2 border border-zinc-200 rounded-lg w-full outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 font-medium outline-none text-xs"
          >
            <option value="ALL">All Categories ({evidence.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 font-medium outline-none text-xs"
          >
            <option value="ALL">All Evidence Types</option>
            <option value="FACT">FACT (Direct Quotes / Verifiable)</option>
            <option value="INFERENCE">INFERENCE (Logical Deduction)</option>
            <option value="WARNING">WARNING (Limitation / Missing)</option>
            <option value="RECOMMENDATION">RECOMMENDATION</option>
          </select>

          {/* Confidence Dropdown */}
          <select
            value={selectedConfidence}
            onChange={(e) => setSelectedConfidence(e.target.value)}
            className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 font-medium outline-none text-xs"
          >
            <option value="ALL">All Confidence Levels</option>
            <option value="HIGH">HIGH Confidence</option>
            <option value="MEDIUM">MEDIUM Confidence</option>
            <option value="LOW">LOW Confidence</option>
          </select>
        </div>
      </div>

      {/* Evidence Grid */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 text-xs">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
          <span>Loading evidence base...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 space-y-2 text-xs text-zinc-500">
          <Database className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="font-semibold text-zinc-900">No Evidence Found</p>
          <p>Try clearing filters or run a new competitor research pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((e) => (
            <EvidenceCard
              key={e.id}
              evidence={e}
              onSelect={() => {
                setSelectedJobId(e.researchJobId);
                setActiveView('research');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
