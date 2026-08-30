import React from 'react';
import { ConfidenceLevel, EvidenceType, JobStatus, ConflictSeverity, ResearchCategory } from '../../types';
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  CircleDashed,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Check,
  BrainCircuit,
  AlertTriangle,
  Sparkles,
  AlertOctagon,
  Info,
  Package,
  DollarSign,
  Compass,
  Users,
  MessageSquare,
  MousePointerClick,
  Target,
  AlertCircle,
  Lightbulb,
  Tag
} from 'lucide-react';

export const getCategoryIcon = (category: ResearchCategory | string) => {
  switch (category) {
    case 'Product':
      return Package;
    case 'Pricing':
      return DollarSign;
    case 'Features':
      return Sparkles;
    case 'Positioning':
      return Compass;
    case 'Audience':
      return Users;
    case 'Messaging':
      return MessageSquare;
    case 'Call To Action':
      return MousePointerClick;
    case 'Differentiators':
      return Target;
    case 'Pain Points':
      return AlertCircle;
    case 'Potential Gaps':
      return Lightbulb;
    case 'Trust Signals':
      return ShieldCheck;
    default:
      return Tag;
  }
};

export const CategoryBadge: React.FC<{ category: ResearchCategory | string }> = ({ category }) => {
  const Icon = getCategoryIcon(category);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-100/90 text-zinc-800 border border-zinc-200 shadow-2xs">
      <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
      <span>{category}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: JobStatus | string }> = ({ status }) => {
  const normStatus = (status || '').toLowerCase();

  const getStyles = () => {
    switch (normStatus) {
      case 'approved':
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'awaiting_review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'researching':
      case 'extracting':
      case 'normalizing':
      case 'analyzing':
      case 'generating':
      case 'validating':
      case 'validating_output':
        return 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse';
      case 'partial':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'failed':
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'queued':
      case 'draft':
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getIcon = () => {
    switch (normStatus) {
      case 'approved':
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'awaiting_review':
        return <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case 'researching':
      case 'extracting':
      case 'normalizing':
      case 'analyzing':
      case 'generating':
      case 'validating':
      case 'validating_output':
        return <Loader2 className="w-3.5 h-3.5 text-blue-600 shrink-0 animate-spin" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      default:
        return <CircleDashed className="w-3.5 h-3.5 text-zinc-500 shrink-0" />;
    }
  };

  const formatText = (s?: string) => {
    return (s || 'UNKNOWN').replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span
      id={`badge-status-${normStatus || 'unknown'}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide uppercase whitespace-nowrap shadow-2xs ${getStyles()}`}
    >
      {getIcon()}
      <span>{formatText(status)}</span>
    </span>
  );
};

export const ConfidenceBadge: React.FC<{ level: ConfidenceLevel | string }> = ({ level }) => {
  const isHigh = level?.toUpperCase() === 'HIGH';
  const isMed = level?.toUpperCase() === 'MEDIUM';

  const getStyles = () => {
    if (isHigh) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (isMed) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-800 border-rose-200';
  };

  const getIcon = () => {
    if (isHigh) return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (isMed) return <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    return <ShieldX className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shadow-2xs ${getStyles()}`}
    >
      {getIcon()}
      <span>{level} CONFIDENCE</span>
    </span>
  );
};

export const EvidenceTypeBadge: React.FC<{ type: EvidenceType | string }> = ({ type }) => {
  const getStyles = () => {
    switch (type) {
      case 'FACT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'INFERENCE':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'WARNING':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'RECOMMENDATION':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'FACT':
        return <Check className="w-3 h-3 text-indigo-600 shrink-0" />;
      case 'INFERENCE':
        return <BrainCircuit className="w-3 h-3 text-violet-600 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />;
      case 'RECOMMENDATION':
        return <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />;
      default:
        return <Tag className="w-3 h-3 text-zinc-500 shrink-0" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wider uppercase shadow-2xs ${getStyles()}`}
    >
      {getIcon()}
      <span>{type}</span>
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: ConflictSeverity | string }> = ({ severity }) => {
  const isHigh = severity === 'HIGH';
  const isMed = severity === 'MEDIUM';

  const getStyles = () => {
    if (isHigh) return 'bg-rose-50 text-rose-800 border-rose-300';
    if (isMed) return 'bg-amber-50 text-amber-800 border-amber-300';
    return 'bg-blue-50 text-blue-800 border-blue-300';
  };

  const getIcon = () => {
    if (isHigh) return <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0" />;
    if (isMed) return <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />;
    return <Info className="w-3 h-3 text-blue-600 shrink-0" />;
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase shadow-2xs ${getStyles()}`}>
      {getIcon()}
      <span>{severity} SEVERITY</span>
    </span>
  );
};
