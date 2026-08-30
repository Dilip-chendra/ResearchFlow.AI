import React, { useState, useEffect } from 'react';
import { CompetitorBattlecard, ResearchJob } from '../../types';
import { api } from '../../lib/api';
import { Swords, ShieldAlert, Sparkles, HelpCircle, AlertOctagon, Copy, Check, Download, RefreshCw, Layers } from 'lucide-react';
import jsPDF from 'jspdf';

interface Props {
  job: ResearchJob;
  onClose?: () => void;
}

export const BattlecardBuilder: React.FC<Props> = ({ job, onClose }) => {
  const [battlecard, setBattlecard] = useState<CompetitorBattlecard | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>(
    job.competitorUrls[0]?.replace(/^https?:\/\//, '').split('/')[0] || job.businessName
  );

  const competitorList = job.competitorUrls.map((u) => u.replace(/^https?:\/\//, '').split('/')[0]).filter(Boolean);
  if (competitorList.length === 0) {
    competitorList.push('Generic Market Incumbent');
  }

  const generateCard = async (cName: string) => {
    try {
      setLoading(true);
      const res = await api.generateBattlecard(job.id, cName);
      setBattlecard(res);
    } catch (err) {
      console.error('Failed to generate battlecard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateCard(selectedCompetitor);
  }, [selectedCompetitor, job.id]);

  const handleCopySection = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportPDF = () => {
    if (!battlecard) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Sales Battlecard: ${job.businessName} vs ${battlecard.competitorName}`, 14, 20);

    doc.setFontSize(10);
    doc.text(`Target Audience: ${battlecard.targetAudience}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);

    doc.setFontSize(13);
    doc.text('Executive Positioning Summary', 14, 46);
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(battlecard.summary, 180);
    doc.text(summaryLines, 14, 52);

    let y = 52 + summaryLines.length * 6 + 6;

    doc.setFontSize(13);
    doc.text('Key Differentiators & Why We Win', 14, y);
    y += 6;
    doc.setFontSize(10);
    battlecard.ourDifferentiators.forEach((d) => {
      const lines = doc.splitTextToSize(`• ${d}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5;
    });

    y += 4;
    doc.setFontSize(13);
    doc.text('Kill-Shot Discovery Questions', 14, y);
    y += 6;
    doc.setFontSize(10);
    battlecard.killShotQuestions.forEach((q) => {
      const lines = doc.splitTextToSize(`• ${q}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5;
    });

    y += 4;
    doc.setFontSize(13);
    doc.text('Competitor Pricing Traps', 14, y);
    y += 6;
    doc.setFontSize(10);
    const pricingLines = doc.splitTextToSize(battlecard.pricingComparisonSummary, 180);
    doc.text(pricingLines, 14, y);

    doc.save(`${job.businessName}-vs-${battlecard.competitorName}-battlecard.pdf`);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 md:p-7 shadow-xs space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Sales Enablement Battlecard</h3>
              <p className="text-xs text-zinc-500">
                Tactical objection playbooks, kill-shot questions, and pricing traps for Account Executives.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {competitorList.length > 1 && (
            <select
              value={selectedCompetitor}
              onChange={(e) => setSelectedCompetitor(e.target.value)}
              className="p-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-800 outline-none"
            >
              {competitorList.map((c) => (
                <option key={c} value={c}>
                  Versus {c}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => generateCard(selectedCompetitor)}
            disabled={loading}
            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
            title="Regenerate with fresh AI synthesis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportPDF}
            disabled={!battlecard || loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Battlecard PDF</span>
          </button>
        </div>
      </div>

      {loading || !battlecard ? (
        <div className="p-12 text-center text-zinc-500 text-xs">
          <div className="animate-spin w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-2" />
          <span>Synthesizing competitive battlecard tactics for {selectedCompetitor}...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs leading-relaxed text-zinc-800 flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Strategic Matchup Summary
              </span>
              <p>{battlecard.summary}</p>
            </div>
            <button
              onClick={() => handleCopySection('summary', battlecard.summary)}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors shrink-0"
              title="Copy Summary"
            >
              {copiedKey === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* 2-Column: Strengths vs Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Competitor Weaknesses */}
            <div className="p-4.5 bg-rose-50/40 rounded-2xl border border-rose-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-rose-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Competitor Chinks in Armor ({selectedCompetitor})</span>
                </h4>
              </div>
              <ul className="space-y-2 text-zinc-700">
                {battlecard.competitorWeaknesses.map((w, idx) => (
                  <li key={idx} className="p-2.5 bg-white rounded-xl border border-rose-200/60 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Our Differentiators */}
            <div className="p-4.5 bg-emerald-50/40 rounded-2xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Why We Win &amp; Core Advantages</span>
                </h4>
              </div>
              <ul className="space-y-2 text-zinc-700">
                {battlecard.ourDifferentiators.map((d, idx) => (
                  <li key={idx} className="p-2.5 bg-white rounded-xl border border-emerald-200/60 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Kill-Shot Questions */}
          <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-indigo-950 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>"Kill-Shot" Discovery Questions (Ask the Buyer)</span>
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                High-Conversion Talk Tracks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {battlecard.killShotQuestions.map((q, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-indigo-100 space-y-2 flex flex-col justify-between">
                  <p className="font-medium text-zinc-800 italic">{q}</p>
                  <button
                    onClick={() => handleCopySection(`q_${idx}`, q)}
                    className="self-end text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
                  >
                    {copiedKey === `q_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Question</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Traps & Landmines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-2">
              <span className="font-bold text-amber-950 block">Pricing Trap Teardown</span>
              <p className="text-zinc-700 leading-relaxed bg-white p-3 rounded-xl border border-amber-200/60">
                {battlecard.pricingComparisonSummary}
              </p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-zinc-500" />
                <span>Landmines to Avoid</span>
              </span>
              <ul className="space-y-1.5 text-zinc-600">
                {battlecard.landminesToAvoid.map((l, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">&bull;</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
