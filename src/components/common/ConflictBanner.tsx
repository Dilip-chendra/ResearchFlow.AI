import React, { useState } from 'react';
import { ConflictItem } from '../../types';
import { SeverityBadge } from './Badge';
import { AlertTriangle, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ConflictBanner: React.FC<{
  conflict: ConflictItem;
  onResolved?: () => void;
}> = ({ conflict, onResolved }) => {
  const { addToast } = useWorkspace();
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState(conflict.resolutionNotes || '');
  const [selectedStatus, setSelectedStatus] = useState<'HUMAN_VERIFIED' | 'DISMISSED'>('HUMAN_VERIFIED');
  const [submitting, setSubmitting] = useState(false);

  const handleSaveResolution = async () => {
    try {
      setSubmitting(true);
      await api.resolveConflict(conflict.id, {
        status: selectedStatus,
        resolutionNotes,
      });
      addToast(`Conflict ${conflict.id} marked as ${selectedStatus}`, 'success');
      setIsResolving(false);
      if (onResolved) onResolved();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isUnresolved = conflict.status === 'UNRESOLVED';

  return (
    <div
      id={`conflict-banner-${conflict.id}`}
      className={`rounded-xl border p-4.5 mb-4 transition-all ${
        isUnresolved
          ? 'bg-amber-50/60 border-amber-300'
          : 'bg-zinc-50/70 border-zinc-200 opacity-90'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isUnresolved ? 'bg-amber-100 text-amber-700' : 'bg-zinc-200 text-zinc-600'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Conflict Detected: {conflict.category}
              </span>
              <SeverityBadge severity={conflict.severity} />
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  isUnresolved
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {conflict.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-zinc-700 mt-1 font-medium">
              {conflict.description}
            </p>
          </div>
        </div>

        {isUnresolved && (
          <button
            id={`btn-resolve-conflict-${conflict.id}`}
            onClick={() => setIsResolving(!isResolving)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 rounded-lg shadow-xs transition-colors shrink-0"
          >
            {isResolving ? 'Close Form' : 'Resolve Conflict'}
          </button>
        )}
      </div>

      {/* Conflicting Source Values Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {conflict.conflictingValues.map((cv, idx) => (
          <div
            key={idx}
            className="p-3 bg-white rounded-lg border border-zinc-200/80 shadow-2xs text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
              <span className="truncate font-semibold text-zinc-800">
                Source {idx + 1}: {cv.sourceTitle}
              </span>
              <a
                href={cv.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline flex items-center gap-0.5 ml-1"
              >
                URL <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="font-mono text-xs bg-zinc-50 text-zinc-900 p-2 rounded border border-zinc-100 font-medium">
              {cv.value}
            </div>
          </div>
        ))}
      </div>

      {/* Resolution Notes Display if already resolved */}
      {!isUnresolved && conflict.resolutionNotes && (
        <div className="mt-3 text-xs bg-white/80 p-2.5 rounded-lg border border-zinc-200 text-zinc-700">
          <span className="font-semibold text-zinc-900">Verification Note:</span> {conflict.resolutionNotes}
        </div>
      )}

      {/* Interactive Resolution Form */}
      {isResolving && (
        <div className="mt-4 p-3.5 bg-white rounded-lg border border-amber-200 shadow-sm space-y-3">
          <h5 className="text-xs font-bold text-zinc-900">Human Verification Decision</h5>
          
          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`res-status-${conflict.id}`}
                value="HUMAN_VERIFIED"
                checked={selectedStatus === 'HUMAN_VERIFIED'}
                onChange={() => setSelectedStatus('HUMAN_VERIFIED')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-zinc-800">Human Verified (Validated against true source)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`res-status-${conflict.id}`}
                value="DISMISSED"
                checked={selectedStatus === 'DISMISSED'}
                onChange={() => setSelectedStatus('DISMISSED')}
                className="text-zinc-600 focus:ring-zinc-500"
              />
              <span className="font-medium text-zinc-800">Dismiss / Non-material discrepancy</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
              Resolution Explanation / Accurate Value
            </label>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              placeholder="e.g., Verified on live pricing page: Competitor A is $19/mo on annual contract, but $29/mo month-to-month."
              className="w-full text-xs p-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsResolving(false)}
              className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveResolution}
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Confirm Resolution'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
