import React, { useState } from 'react';
import { Evidence } from '../../types';
import { ConfidenceBadge, EvidenceTypeBadge, CategoryBadge } from './Badge';
import { ExternalLink, Quote, Copy, Check, Sparkles, Edit3, ShieldCheck, Clock } from 'lucide-react';
import { EditEvidenceModal } from '../evidence/EditEvidenceModal';

export const EvidenceCard: React.FC<{
  evidence: Evidence;
  onSelect?: () => void;
  onUpdated?: (updated: Evidence) => void;
  isSelected?: boolean;
}> = ({ evidence, onSelect, onUpdated, isSelected }) => {
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEvidence, setCurrentEvidence] = useState<Evidence>(evidence);

  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentEvidence.supportingText || currentEvidence.claim);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div
        id={`evidence-card-${currentEvidence.id}`}
        onClick={onSelect}
        className={`rounded-2xl border p-4.5 transition-all duration-200 flex flex-col justify-between ${
          isSelected
            ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-xs'
            : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-2xs'
        } ${onSelect ? 'cursor-pointer' : ''}`}
      >
        <div>
          {/* Top Badges Bar with Symbols */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <CategoryBadge category={currentEvidence.category} />
              <EvidenceTypeBadge type={currentEvidence.evidenceType} />
              <ConfidenceBadge level={currentEvidence.confidence} />
              {currentEvidence.version && currentEvidence.version > 1 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200 font-mono" title="Revision Version">
                  v{currentEvidence.version}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleOpenEdit}
                className="p-1 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                title="Edit verified claim & inspect version history"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-semibold text-zinc-400 px-2 py-0.5 bg-zinc-50 rounded-md border border-zinc-100">
                #{currentEvidence.id.split('_').slice(-2).join('_')}
              </span>
            </div>
          </div>

          {/* Verified Claim Heading */}
          <h4 className="text-sm font-bold text-zinc-900 leading-snug mb-2.5">
            {currentEvidence.claim}
          </h4>

          {/* Supporting Quote in Styled Card */}
          {currentEvidence.supportingText && (
            <div className="relative p-3 mb-3 bg-zinc-50/80 rounded-xl border border-zinc-200/70 text-xs text-zinc-700 leading-relaxed group">
              <div className="flex items-start gap-2">
                <Quote className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5 opacity-80" />
                <p className="italic flex-1 text-zinc-600 line-clamp-3">
                  "{currentEvidence.supportingText}"
                </p>
                <button
                  onClick={handleCopyQuote}
                  className="p-1 rounded text-zinc-400 hover:text-indigo-600 transition-colors shrink-0"
                  title="Copy verified quote"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Normalized Extracted Metric / Value */}
          {currentEvidence.normalizedValue && (
            <div className="mb-3 text-xs bg-indigo-50/50 text-indigo-950 px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Extracted Benchmark:</span>
              </span>
              <span className="font-mono font-bold text-zinc-900">{currentEvidence.normalizedValue}</span>
            </div>
          )}
        </div>

        {/* Source Provenance Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-[11px] text-zinc-500">
          <span className="truncate max-w-[200px] font-medium text-zinc-700" title={currentEvidence.sourceTitle || currentEvidence.sourceUrl}>
            {currentEvidence.sourceTitle || 'Competitor Webpage'}
          </span>
          <a
            href={currentEvidence.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold hover:underline ml-2 shrink-0"
          >
            <span>Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {isEditModalOpen && (
        <EditEvidenceModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          evidence={currentEvidence}
          onUpdated={(updated) => {
            setCurrentEvidence(updated);
            if (onUpdated) onUpdated(updated);
          }}
        />
      )}
    </>
  );
};

