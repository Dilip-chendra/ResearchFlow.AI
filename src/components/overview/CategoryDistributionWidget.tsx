import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Evidence, ResearchCategory, ResearchJob } from '../../types';
import {
  BarChart3,
  PieChart as PieIcon,
  Radar as RadarIcon,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  ShieldCheck,
  Tag,
  Info
} from 'lucide-react';

interface CategoryDistributionWidgetProps {
  evidence: Evidence[];
  jobs: ResearchJob[];
  onExploreCategory?: (category: ResearchCategory) => void;
  onExploreAllEvidence?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Pricing: '#6366f1', // Indigo
  Positioning: '#3b82f6', // Blue
  Features: '#0ea5e9', // Sky
  Audience: '#10b981', // Emerald
  Messaging: '#8b5cf6', // Violet
  Differentiators: '#f59e0b', // Amber
  'Pain Points': '#ef4444', // Red
  'Potential Gaps': '#ec4899', // Pink
  'Trust Signals': '#14b8a6', // Teal
  Product: '#64748b', // Slate
  'Call To Action': '#f97316', // Orange
};

const DEFAULT_COLOR = '#94a3b8';

export const CategoryDistributionWidget: React.FC<CategoryDistributionWidgetProps> = ({
  evidence,
  jobs,
  onExploreCategory,
  onExploreAllEvidence,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'radar'>('bar');
  const [breakdownMode, setBreakdownMode] = useState<'confidence' | 'type'>('confidence');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('ALL');

  // Filter evidence if a specific job is selected
  const filteredEvidence = useMemo(() => {
    if (selectedJobFilter === 'ALL') return evidence;
    return evidence.filter((e) => e.researchJobId === selectedJobFilter);
  }, [evidence, selectedJobFilter]);

  // Aggregate by Category
  const categoryStats = useMemo(() => {
    const map: Record<
      string,
      {
        category: string;
        total: number;
        highConfidence: number;
        medConfidence: number;
        lowConfidence: number;
        facts: number;
        inferences: number;
        recommendations: number;
        warnings: number;
        color: string;
      }
    > = {};

    filteredEvidence.forEach((item) => {
      const cat = item.category || 'Product';
      if (!map[cat]) {
        map[cat] = {
          category: cat,
          total: 0,
          highConfidence: 0,
          medConfidence: 0,
          lowConfidence: 0,
          facts: 0,
          inferences: 0,
          recommendations: 0,
          warnings: 0,
          color: CATEGORY_COLORS[cat] || DEFAULT_COLOR,
        };
      }

      map[cat].total += 1;

      // Confidence
      if (item.confidence === 'HIGH') map[cat].highConfidence += 1;
      else if (item.confidence === 'MEDIUM') map[cat].medConfidence += 1;
      else map[cat].lowConfidence += 1;

      // Evidence Type
      if (item.evidenceType === 'FACT') map[cat].facts += 1;
      else if (item.evidenceType === 'INFERENCE') map[cat].inferences += 1;
      else if (item.evidenceType === 'RECOMMENDATION') map[cat].recommendations += 1;
      else if (item.evidenceType === 'WARNING') map[cat].warnings += 1;
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredEvidence]);

  const totalEvidenceCount = filteredEvidence.length;

  // Pie chart data with percentages
  const pieData = useMemo(() => {
    return categoryStats.map((item) => ({
      name: item.category,
      value: item.total,
      percentage: totalEvidenceCount > 0 ? Math.round((item.total / totalEvidenceCount) * 100) : 0,
      color: item.color,
    }));
  }, [categoryStats, totalEvidenceCount]);

  // Radar chart data
  const radarData = useMemo(() => {
    const standardCategories: ResearchCategory[] = [
      'Pricing',
      'Positioning',
      'Features',
      'Audience',
      'Messaging',
      'Differentiators',
      'Pain Points',
      'Trust Signals',
    ];

    return standardCategories.map((cat) => {
      const found = categoryStats.find((c) => c.category === cat);
      return {
        category: cat,
        count: found ? found.total : 0,
        highConfidence: found ? found.highConfidence : 0,
      };
    });
  }, [categoryStats]);

  // Summary Metrics
  const topCategory = categoryStats[0];
  const highConfidenceTotal = categoryStats.reduce((acc, c) => acc + c.highConfidence, 0);
  const highConfidenceRatio =
    totalEvidenceCount > 0 ? Math.round((highConfidenceTotal / totalEvidenceCount) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
              AI Research Category Distribution
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded uppercase">
              Recharts Visualizer
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Breakdown of evidence claims, competitor signals, and market intelligence classified by AI tagging.
          </p>
        </div>

        {/* View Controls & Job Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Job Filter Dropdown if multiple jobs */}
          {jobs.length > 1 && (
            <div className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                id="select-category-job-filter"
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-zinc-700 focus:ring-0 outline-none cursor-pointer"
              >
                <option value="ALL">All Research Pipelines ({jobs.length})</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.businessName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chart Type Selector */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
            <button
              id="btn-chart-bar"
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${
                chartType === 'bar'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Bar Chart View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bar Chart</span>
            </button>

            <button
              id="btn-chart-pie"
              onClick={() => setChartType('pie')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${
                chartType === 'pie'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Donut / Pie View"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Donut Share</span>
            </button>

            <button
              id="btn-chart-radar"
              onClick={() => setChartType('radar')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${
                chartType === 'radar'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Radar Pillar Coverage"
            >
              <RadarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Radar Pillars</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown Sub-Bar for Bar Chart */}
      {chartType === 'bar' && (
        <div className="px-5 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-500">
            <Layers className="w-3.5 h-3.5" />
            <span className="font-semibold text-zinc-700">Sub-Breakdown Layer:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-breakdown-confidence"
              onClick={() => setBreakdownMode('confidence')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                breakdownMode === 'confidence'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              By Confidence Tier (High / Med / Low)
            </button>
            <button
              id="btn-breakdown-type"
              onClick={() => setBreakdownMode('type')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                breakdownMode === 'type'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              By Evidence Type (Fact / Inference / Rec)
            </button>
          </div>
        </div>
      )}

      {/* Main Chart Area */}
      <div className="p-5">
        {categoryStats.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs space-y-2">
            <Tag className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-semibold text-zinc-800">No Tagged Evidence Found</p>
            <p className="max-w-md mx-auto text-zinc-500">
              Run a competitor research pipeline to automatically extract and tag category claims.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            {/* Chart Visualizer (3 cols on lg) */}
            <div className="lg:col-span-3 h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart
                    data={categoryStats}
                    margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11, fill: '#475569' }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={45}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = categoryStats.find((c) => c.category === label);
                          return (
                            <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-zinc-800">
                              <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-1">
                                <span className="font-bold text-zinc-100">{label}</span>
                                <span className="font-mono text-indigo-300 font-bold">
                                  {item?.total} claims (
                                  {totalEvidenceCount > 0
                                    ? Math.round(((item?.total || 0) / totalEvidenceCount) * 100)
                                    : 0}
                                  %)
                                </span>
                              </div>
                              {breakdownMode === 'confidence' ? (
                                <div className="space-y-1 text-[11px] pt-0.5">
                                  <div className="flex items-center justify-between gap-2 text-emerald-400">
                                    <span>High Confidence:</span>
                                    <span className="font-mono">{item?.highConfidence}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-2 text-amber-400">
                                    <span>Medium Confidence:</span>
                                    <span className="font-mono">{item?.medConfidence}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-2 text-rose-400">
                                    <span>Low / Unverified:</span>
                                    <span className="font-mono">{item?.lowConfidence}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1 text-[11px] pt-0.5">
                                  <div className="flex items-center justify-between gap-2 text-indigo-300">
                                    <span>Verified Facts:</span>
                                    <span className="font-mono">{item?.facts}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-2 text-sky-300">
                                    <span>Market Inferences:</span>
                                    <span className="font-mono">{item?.inferences}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-2 text-emerald-300">
                                    <span>Recommendations:</span>
                                    <span className="font-mono">{item?.recommendations}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-2 text-rose-300">
                                    <span>Risk Warnings:</span>
                                    <span className="font-mono">{item?.warnings}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                    />
                    {breakdownMode === 'confidence' ? (
                      <>
                        <Bar
                          dataKey="highConfidence"
                          name="High Confidence"
                          stackId="a"
                          fill="#10b981"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="medConfidence"
                          name="Medium Confidence"
                          stackId="a"
                          fill="#f59e0b"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="lowConfidence"
                          name="Low Confidence"
                          stackId="a"
                          fill="#ef4444"
                          radius={[4, 4, 0, 0]}
                        />
                      </>
                    ) : (
                      <>
                        <Bar
                          dataKey="facts"
                          name="Facts"
                          stackId="b"
                          fill="#6366f1"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="inferences"
                          name="Inferences"
                          stackId="b"
                          fill="#0ea5e9"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="recommendations"
                          name="Recommendations"
                          stackId="b"
                          fill="#10b981"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="warnings"
                          name="Warnings"
                          stackId="b"
                          fill="#f43f5e"
                          radius={[4, 4, 0, 0]}
                        />
                      </>
                    )}
                  </BarChart>
                ) : chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={2}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${value} claims (${
                          totalEvidenceCount > 0
                            ? Math.round((Number(value) / totalEvidenceCount) * 100)
                            : 0
                        }%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                ) : (
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Total Evidence Claims"
                      dataKey="count"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="High Confidence Claims"
                      dataKey="highConfidence"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.4}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Tooltip />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Right Summary Metrics Card (1 col on lg) */}
            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/80 space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <span className="font-bold text-zinc-900">Coverage Summary</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {totalEvidenceCount} Claims Tagged
                </span>
              </div>

              {/* Top Tagged Category */}
              {topCategory && (
                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-500">Dominant Category</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: topCategory.color }}
                      />
                      {topCategory.category}
                    </span>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {topCategory.total} items
                    </span>
                  </div>
                </div>
              )}

              {/* Verification Quality Score */}
              <div className="space-y-1">
                <span className="text-[11px] text-zinc-500">High-Confidence Ratio</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 font-bold text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{highConfidenceRatio}% Verified</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {highConfidenceTotal}/{totalEvidenceCount}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${highConfidenceRatio}%` }}
                  />
                </div>
              </div>

              {/* Category Quick Badges */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Top Research Sectors
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {categoryStats.slice(0, 5).map((c) => (
                    <button
                      key={c.category}
                      onClick={() => onExploreCategory && onExploreCategory(c.category as ResearchCategory)}
                      className="px-2 py-0.5 bg-white hover:bg-zinc-100 text-zinc-700 rounded border border-zinc-200 text-[10px] font-semibold transition-colors flex items-center gap-1"
                      title={`Explore ${c.category} in Evidence Base`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span>{c.category}</span>
                      <span className="text-zinc-400 font-mono">({c.total})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deep Link to Evidence Explorer */}
              {onExploreAllEvidence && (
                <button
                  id="btn-explore-evidence-from-chart"
                  onClick={onExploreAllEvidence}
                  className="w-full mt-2 pt-2 border-t border-zinc-200/80 flex items-center justify-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold text-[11px] transition-colors"
                >
                  <span>Explore Full Evidence Base</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
