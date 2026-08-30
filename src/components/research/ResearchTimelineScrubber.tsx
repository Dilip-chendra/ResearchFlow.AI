import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ResearchJob } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  Layers,
  ArrowRight,
  Share2,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ResearchTimelineScrubberProps {
  jobs: ResearchJob[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
  onShareJob?: (job: ResearchJob) => void;
}

export const ResearchTimelineScrubber: React.FC<ResearchTimelineScrubberProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  onShareJob,
}) => {
  // Sort jobs chronologically (oldest to newest for chronological evolution)
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [jobs]);

  // Topic / Business Filter for focused evolution tracking
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState(true);

  // Available topics
  const topics = useMemo(() => {
    const list = Array.from(new Set(jobs.map((j) => j.businessName.trim()).filter(Boolean)));
    return ['ALL', ...list];
  }, [jobs]);

  // Filtered jobs according to selected topic
  const topicJobs = useMemo(() => {
    if (selectedTopic === 'ALL') return sortedJobs;
    return sortedJobs.filter((j) => j.businessName.trim() === selectedTopic);
  }, [sortedJobs, selectedTopic]);

  // Active scrubbed index
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Update active index when topicJobs change
  useEffect(() => {
    if (topicJobs.length === 0) {
      setActiveIndex(0);
      return;
    }
    // If selectedJobId exists in topicJobs, focus on it
    if (selectedJobId) {
      const idx = topicJobs.findIndex((j) => j.id === selectedJobId);
      if (idx !== -1) {
        setActiveIndex(idx);
        return;
      }
    }
    // Default to the latest entry in chronological progression
    setActiveIndex(topicJobs.length - 1);
  }, [topicJobs, selectedJobId]);

  // Autoplay timer
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setActiveIndex((prev) => {
          if (prev >= topicJobs.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2400 / playbackSpeed);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, topicJobs.length]);

  const activeJob = topicJobs[activeIndex] || null;

  // Scroll container ref for horizontal navigation
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineScrollRef.current) {
      const offset = direction === 'left' ? -240 : 240;
      timelineScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Scroll active milestone into view
  useEffect(() => {
    if (timelineScrollRef.current && topicJobs.length > 0) {
      const activeEl = timelineScrollRef.current.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeIndex, topicJobs.length]);

  // Cumulative evolution metrics up to activeIndex
  const cumulativeStats = useMemo(() => {
    const historicalSlice = topicJobs.slice(0, activeIndex + 1);
    const totalEvidence = historicalSlice.reduce((sum, j) => sum + (j.evidenceCount || 0), 0);
    const totalSources = historicalSlice.reduce((sum, j) => sum + (j.sourcesCount || 0), 0);
    const totalConflicts = historicalSlice.reduce((sum, j) => sum + (j.conflictsCount || 0), 0);
    return {
      entriesCount: historicalSlice.length,
      totalEvidence,
      totalSources,
      totalConflicts,
    };
  }, [topicJobs, activeIndex]);

  if (jobs.length === 0) return null;

  return (
    <div
      id="research-horizontal-timeline"
      className="w-full max-w-full bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden transition-all"
    >
      {/* Timeline Header & Scrubber Controls Bar */}
      <div className="px-3.5 sm:px-5 py-3 bg-gradient-to-r from-zinc-50 via-indigo-50/20 to-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 tracking-tight truncate">Market Topic Evolution Timeline</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 shrink-0">
                {topicJobs.length} {topicJobs.length === 1 ? 'Milestone' : 'Milestones'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 truncate hidden sm:block">
              Scrub chronologically to track research claims, competitive angle shifts, and evidence growth over time.
            </p>
          </div>
        </div>

        {/* Timeline Interaction Toolbar */}
        <div className="flex items-center justify-between sm:justify-end flex-wrap gap-2 text-xs">
          {/* Topic Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs max-w-[170px] sm:max-w-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-[10px] sm:text-[11px] text-zinc-500 font-medium shrink-0">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setIsPlaying(false);
              }}
              className="text-[11px] sm:text-xs font-bold text-zinc-800 bg-transparent outline-none cursor-pointer truncate pr-1 w-full"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t === 'ALL' ? 'All Market Topics' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Player Controls (Play, Step Backward, Step Forward, Speed) */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-0.5 shadow-2xs shrink-0">
            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={activeIndex === 0}
              className="p-1 sm:p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
              title="Step backward"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (activeIndex >= topicJobs.length - 1 && !isPlaying) {
                  setActiveIndex(0);
                }
                setIsPlaying(!isPlaying);
              }}
              className={`p-1 sm:p-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 px-2 sm:px-2.5 ${
                isPlaying
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              title={isPlaying ? 'Pause timelapse playback' : 'Play chronological timelapse'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span className="text-[10px] sm:text-[11px]">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="text-[10px] sm:text-[11px]">Play</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveIndex((prev) => Math.min(topicJobs.length - 1, prev + 1));
              }}
              disabled={activeIndex >= topicJobs.length - 1}
              className="p-1 sm:p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
              title="Step forward"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
              className="px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-bold text-zinc-600 hover:text-indigo-600 hover:bg-zinc-100 rounded-md transition-colors border-l border-zinc-100"
              title="Toggle playback speed"
            >
              {playbackSpeed}x
            </button>
          </div>

          {/* Toggle Expand / Compact */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 sm:p-1.5 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-lg transition-colors shrink-0"
            title={isExpanded ? 'Collapse timeline snapshot' : 'Expand full snapshot'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Scrubber Track & Horizontal Milestones Axis */}
      <div className="p-3.5 sm:p-5 bg-zinc-900 text-white relative">
        {/* Continuous Progress Bar Indicator */}
        <div className="relative mb-4 sm:mb-6">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 font-mono mb-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-none">
                {topicJobs[0] ? new Date(topicJobs[0].createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Start'}
              </span>
            </span>

            <span className="text-[11px] sm:text-xs font-bold text-indigo-300">
              Milestone {activeIndex + 1} of {topicJobs.length} (
              {topicJobs.length > 1 ? Math.round((activeIndex / (topicJobs.length - 1)) * 100) : 100}%)
            </span>

            <span className="truncate max-w-[90px] sm:max-w-none text-right">
              {topicJobs[topicJobs.length - 1]
                ? new Date(topicJobs[topicJobs.length - 1].createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Present'}
            </span>
          </div>

          {/* Continuous interactive scrub slider */}
          <div className="relative w-full h-4 sm:h-3 bg-zinc-800 rounded-full cursor-pointer flex items-center group">
            {/* Active progress fill */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-300 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
              style={{
                width: `${topicJobs.length > 1 ? (activeIndex / (topicJobs.length - 1)) * 100 : 100}%`,
              }}
            />

            {/* Native slider for precise dragging and keyboard accessibility */}
            <input
              id="timeline-scrubber-slider"
              type="range"
              min={0}
              max={Math.max(0, topicJobs.length - 1)}
              step={1}
              value={activeIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setActiveIndex(Number(e.target.value));
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              aria-label="Timeline Chronological Scrubber"
            />

            {/* Glowing Playhead Pin with clamped edge safety */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-white border-2 border-indigo-600 rounded-full shadow-lg pointer-events-none z-10 transition-all duration-300 flex items-center justify-center"
              style={{
                left: `clamp(10px, ${topicJobs.length > 1 ? (activeIndex / (topicJobs.length - 1)) * 100 : 100}%, calc(100% - 10px))`,
              }}
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-600" />
            </div>
          </div>
        </div>

        {/* Horizontal Milestone Nodes Axis (Scrollable Ribbon with fluid card sizing & clean padding) */}
        <div className="relative group/ribbon">
          {topicJobs.length > 3 && (
            <>
              <button
                onClick={() => scrollTimeline('left')}
                className="absolute -left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-zinc-950/90 hover:bg-zinc-800 text-white border border-zinc-700 shadow-xl backdrop-blur-xs transition-all hidden sm:flex items-center justify-center opacity-0 group-hover/ribbon:opacity-100"
                title="Scroll timeline left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollTimeline('right')}
                className="absolute -right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-zinc-950/90 hover:bg-zinc-800 text-white border border-zinc-700 shadow-xl backdrop-blur-xs transition-all hidden sm:flex items-center justify-center opacity-0 group-hover/ribbon:opacity-100"
                title="Scroll timeline right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Ribbon scroll container with generous spacing and alignment */}
          <div
            ref={timelineScrollRef}
            className="w-full flex items-stretch gap-3 overflow-x-auto py-1 px-0.5 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent snap-x touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {topicJobs.map((job, idx) => {
              const isCurrent = idx === activeIndex;
              const isPast = idx < activeIndex;
              const jobDate = new Date(job.createdAt);

              return (
                <div
                  key={job.id}
                  data-index={idx}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveIndex(idx);
                  }}
                  className={`w-[200px] sm:w-[220px] md:w-[240px] shrink-0 p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer snap-start select-none flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-indigo-950/90 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] ring-2 ring-indigo-400/50 scale-[1.01]'
                      : isPast
                      ? 'bg-zinc-800/90 border-zinc-700 hover:border-zinc-500 opacity-90'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5">
                    {/* Node Top Date & Step */}
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={isCurrent ? 'text-indigo-300 font-bold' : 'text-zinc-400'}>
                        {jobDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isCurrent
                            ? 'bg-indigo-500 text-white shadow-xs'
                            : isPast
                            ? 'bg-zinc-700 text-zinc-300'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Topic / Business Name */}
                    <h4
                      className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-white' : 'text-zinc-200'
                      }`}
                      title={job.businessName}
                    >
                      {job.businessName}
                    </h4>

                    {/* Objective Snippet */}
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed break-words">
                      {job.campaignObjective || 'Competitive market research run'}
                    </p>
                  </div>

                  {/* Mini Metric Badges */}
                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-zinc-700/60 text-[10px] font-mono shrink-0">
                    <span className="text-indigo-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>{job.evidenceCount || 0} claims</span>
                    </span>
                    <span className="text-zinc-400">{job.sourcesCount || 0} src</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Evolution Snapshot & Comparative Milestone Details (Expanded View) */}
      {isExpanded && activeJob && (
        <div className="p-3.5 sm:p-5 bg-white border-t border-zinc-200">
          <div className="flex flex-col gap-4">
            {/* Active Milestone Highlight */}
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-indigo-200 inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span>
                    {new Date(activeJob.createdAt).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </span>
                <StatusBadge status={activeJob.status} />
                {activeJob.isDemo && (
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md uppercase">
                    Sample Data
                  </span>
                )}
              </div>

              <h4 className="text-sm sm:text-base font-bold text-zinc-900 leading-snug break-words">
                {activeJob.businessName}: <span className="font-normal text-zinc-700">{activeJob.campaignObjective}</span>
              </h4>

              {activeJob.targetAudience && (
                <p className="text-xs text-zinc-500 line-clamp-2 break-words">
                  <strong className="text-zinc-700">Target Audience:</strong> {activeJob.targetAudience}
                </p>
              )}
            </div>

            {/* Metrics & Actions Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-zinc-100">
              {/* Cumulative Evolution Statistics Ticker with Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 bg-zinc-50 p-2 sm:p-2.5 rounded-xl border border-zinc-200/90 shadow-2xs w-full lg:w-auto">
                <div className="px-2 py-1 text-center sm:border-r border-zinc-200">
                  <div className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-semibold">Evidence Total</div>
                  <div className="text-xs sm:text-sm font-black text-indigo-600">{cumulativeStats.totalEvidence}</div>
                </div>
                <div className="px-2 py-1 text-center border-zinc-200 sm:border-r">
                  <div className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-semibold">Sources Indexed</div>
                  <div className="text-xs sm:text-sm font-black text-zinc-800">{cumulativeStats.totalSources}</div>
                </div>
                <div className="px-2 py-1 text-center sm:border-r border-zinc-200">
                  <div className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-semibold">Conflicts Flagged</div>
                  <div className={`text-xs sm:text-sm font-black ${cumulativeStats.totalConflicts > 0 ? 'text-amber-600' : 'text-zinc-700'}`}>
                    {cumulativeStats.totalConflicts}
                  </div>
                </div>
                <div className="px-2 py-1 text-center">
                  <div className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-semibold">Timeline Step</div>
                  <div className="text-xs sm:text-sm font-black text-zinc-800">{activeIndex + 1}/{topicJobs.length}</div>
                </div>
              </div>

              {/* Direct Action Buttons */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                {onShareJob && (
                  <button
                    id={`btn-timeline-share-${activeJob.id}`}
                    onClick={() => onShareJob(activeJob)}
                    className="flex-1 lg:flex-initial px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold rounded-xl border border-zinc-200 text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    title="Share or assign review for this milestone"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Share</span>
                  </button>
                )}

                <button
                  id={`btn-timeline-inspect-${activeJob.id}`}
                  onClick={() => onSelectJob(activeJob.id)}
                  className="flex-1 lg:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 group"
                >
                  <span>Inspect Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
