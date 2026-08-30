import React, { useState } from 'react';
import { ResearchJob, ResearchSource, Evidence, ConflictItem, CampaignBrief, CampaignAsset, ExecutionTask } from '../../types';
import {
  exportEvidenceToCSV,
  exportFullJobToCSV,
  generateResearchJobPDF
} from '../../lib/exportUtils';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Download,
  X,
  Check,
  Sparkles,
  Layers,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Eye,
  Sliders,
  CheckCircle2,
  Copy
} from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobData: {
    job: ResearchJob;
    sources: ResearchSource[];
    evidence: Evidence[];
    conflicts: ConflictItem[];
    campaignBrief?: CampaignBrief;
    assets?: CampaignAsset[];
    tasks?: ExecutionTask[];
  };
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  jobData,
}) => {
  const { job, sources, evidence, conflicts, campaignBrief, assets, tasks } = jobData;

  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [includeBrief, setIncludeBrief] = useState(true);
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeSources, setIncludeSources] = useState(true);
  const [includeConflicts, setIncludeConflicts] = useState(true);
  const [includeAssets, setIncludeAssets] = useState(true);
  const [activeTab, setActiveTab] = useState<'options' | 'preview'>('options');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      generateResearchJobPDF(jobData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      exportFullJobToCSV({
        job,
        sources: includeSources ? sources : [],
        evidence: includeEvidence ? evidence : [],
        conflicts: includeConflicts ? conflicts : [],
        campaignBrief: includeBrief ? campaignBrief : undefined,
        tasks: tasks || [],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Export Research & Intelligence Report
              </h3>
              <p className="text-xs text-zinc-500">
                Export gathered evidence, competitor audits, and strategic campaign copy for offline presentation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-200 px-6 bg-white gap-6 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('options')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'options'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Export Configuration</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Document Preview</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'options' ? (
            <div className="space-y-6">
              {/* Format selection cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-3">
                  1. Choose Export Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PDF Card */}
                  <div
                    onClick={() => setExportFormat('pdf')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                      exportFormat === 'pdf'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-zinc-900">PDF Report Document</h4>
                        {exportFormat === 'pdf' && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        High-resolution printable briefing with cover sheet, executive summary, grounded evidence tables, and citations.
                      </p>
                    </div>
                  </div>

                  {/* CSV Card */}
                  <div
                    onClick={() => setExportFormat('csv')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                      exportFormat === 'csv'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-zinc-900">CSV Raw Data Spreadsheet</h4>
                        {exportFormat === 'csv' && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Structured tabular spreadsheet for Excel, Google Sheets, or data pipeline import with full citation metadata.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Toggles */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-3">
                  2. Select Report Sections to Include
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 cursor-pointer hover:bg-zinc-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeEvidence}
                      onChange={(e) => setIncludeEvidence(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-zinc-900 block">Verified Evidence Matrix</span>
                      <span className="text-zinc-500">{evidence.length} extracted claims & quotes</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 cursor-pointer hover:bg-zinc-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeBrief}
                      onChange={(e) => setIncludeBrief(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-zinc-900 block">Strategic Campaign Brief</span>
                      <span className="text-zinc-500">Angle, primary message & positioning</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 cursor-pointer hover:bg-zinc-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeSources}
                      onChange={(e) => setIncludeSources(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-zinc-900 block">Competitor Sources & URLs</span>
                      <span className="text-zinc-500">{sources.length} audited crawl URLs</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 cursor-pointer hover:bg-zinc-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeConflicts}
                      onChange={(e) => setIncludeConflicts(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-zinc-900 block">Pricing Conflict Audit</span>
                      <span className="text-zinc-500">{conflicts.length} identified claim discrepancies</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-indigo-900">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span>
                    Report target: <strong>{job.businessName}</strong> ({evidence.length} evidence points, {sources.length} sources)
                  </span>
                </div>
                <span className="text-[11px] font-medium text-indigo-700 bg-white px-2.5 py-1 rounded-md border border-indigo-200">
                  Ready for Export
                </span>
              </div>
            </div>
          ) : (
            /* Live Presentation Preview */
            <div id="printable-research-report" className="bg-white p-6 sm:p-8 rounded-xl border border-zinc-200 shadow-2xs space-y-6 text-zinc-900">
              {/* Header Box */}
              <div className="p-6 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    Evidence-Grounded Intelligence Report
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{job.businessName}</h2>
                <p className="text-xs text-slate-300">
                  <strong>Objective:</strong> {job.campaignObjective}
                </p>
                <p className="text-xs text-slate-400">
                  <strong>Audience:</strong> {job.targetAudience}
                </p>
              </div>

              {/* Strategic Angle (if brief) */}
              {campaignBrief && includeBrief && (
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Strategic Campaign Angle & Mandate
                  </h4>
                  <p className="text-sm font-semibold text-zinc-900">
                    "{campaignBrief.campaignAngle}"
                  </p>
                  <p className="text-xs text-zinc-700">
                    {campaignBrief.primaryMessage}
                  </p>
                </div>
              )}

              {/* Evidence Matrix */}
              {includeEvidence && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Grounded Evidence Repository ({evidence.length} items)
                  </h4>
                  <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl overflow-hidden text-xs">
                    {evidence.map((ev, i) => (
                      <div key={ev.id} className="p-3 bg-white hover:bg-zinc-50/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold text-[10px]">
                            {ev.category}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                            {ev.confidence} CONFIDENCE
                          </span>
                        </div>
                        <p className="font-semibold text-zinc-900">{ev.claim}</p>
                        {ev.supportingText && (
                          <p className="text-zinc-500 italic mt-0.5">"{ev.supportingText}"</p>
                        )}
                        <p className="text-[11px] text-indigo-600 mt-1">
                          Source: {ev.sourceTitle || ev.sourceUrl}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources */}
              {includeSources && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Audited Competitor Sources
                  </h4>
                  <ul className="text-xs space-y-1 text-zinc-700">
                    {sources.map((s) => (
                      <li key={s.id} className="flex items-center justify-between py-1 border-b border-zinc-100">
                        <span className="font-medium truncate max-w-md">{s.title || s.url}</span>
                        <span className="text-zinc-400 font-mono text-[11px]">{s.wordCount || 0} words</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-lg border border-zinc-300 shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-zinc-500" />
              <span>Print / Present Mode</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-lg border border-zinc-300 transition-colors"
            >
              Cancel
            </button>

            {exportFormat === 'pdf' ? (
              <button
                id="btn-confirm-export-pdf"
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>{isExporting ? 'Generating PDF...' : 'Download PDF Report'}</span>
              </button>
            ) : (
              <button
                id="btn-confirm-export-csv"
                onClick={handleExportCSV}
                disabled={isExporting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isExporting ? 'Generating CSV...' : 'Download CSV Report'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
