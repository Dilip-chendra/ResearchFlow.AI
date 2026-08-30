import React, { useState, useEffect, useRef } from 'react';
import { PerceptualMatrixData, MatrixCompetitorPoint } from '../../types';
import { api } from '../../lib/api';
import { X, Sparkles, Compass, Download, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

interface Props {
  jobId: string;
  businessName: string;
  onClose: () => void;
}

const AXIS_PRESETS = [
  { x: 'Enterprise Scale & Compliance', y: 'Value & ROI Efficiency' },
  { x: 'Feature Breadth & Ecosystem', y: 'Simplicity & Onboarding Speed' },
  { x: 'Pricing Transparency', y: 'Developer Velocity' },
];

export const PositioningMatrixModal: React.FC<Props> = ({ jobId, businessName, onClose }) => {
  const [data, setData] = useState<PerceptualMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<MatrixCompetitorPoint | null>(null);
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const loadMatrix = async (xAxis?: string, yAxis?: string) => {
    try {
      setLoading(true);
      const res = await api.getPerceptualMatrix(jobId, xAxis, yAxis);
      setData(res);
      if (res.points.length > 0) {
        setSelectedPoint(res.points[0]);
      }
    } catch (err) {
      console.error('Failed to load matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix(AXIS_PRESETS[0].x, AXIS_PRESETS[0].y);
  }, [jobId]);

  const handleSwitchPreset = async (index: number) => {
    setActivePresetIndex(index);
    const preset = AXIS_PRESETS[index];
    setIsRecalculating(true);
    try {
      const res = await api.recalculatePerceptualMatrix(jobId, preset.x, preset.y);
      setData(res);
      if (res.points.length > 0) {
        setSelectedPoint(res.points[0]);
      }
    } catch (err) {
      console.error('Failed to recalculate:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${businessName}-positioning-matrix.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900">Perceptual Positioning Matrix</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                  Interactive 2D Radar
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Market quadrant clustering and white-space positioning detector for {businessName}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSVG}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Export SVG</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-200/80 rounded-xl text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Switcher */}
        <div className="px-6 py-3 bg-zinc-100/70 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-zinc-600">Coordinate Dimension:</span>
            {AXIS_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSwitchPreset(idx)}
                disabled={isRecalculating}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activePresetIndex === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                }`}
              >
                {preset.x} &times; {preset.y}
              </button>
            ))}
          </div>

          {isRecalculating && (
            <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Re-evaluating coordinates...</span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Canvas Radar */}
          <div className="lg:col-span-7 bg-zinc-950 rounded-2xl p-4 sm:p-6 border border-zinc-800 relative shadow-inner flex flex-col items-center">
            {loading || !data ? (
              <div className="h-80 flex items-center justify-center text-zinc-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Calculating competitive vectors...
              </div>
            ) : (
              <div className="w-full relative">
                {/* Quadrant Labels in Background */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none p-6 text-[10px] font-bold tracking-wider uppercase">
                  <div className="text-indigo-400/40 p-2">Visionaries (High Y, Low X)</div>
                  <div className="text-emerald-400/50 p-2 text-right">Leaders &amp; Dominators</div>
                  <div className="text-zinc-600/40 p-2 flex items-end">Niche Specialists</div>
                  <div className="text-amber-400/40 p-2 flex items-end justify-end">Legacy Challengers</div>
                </div>

                <svg
                  ref={svgRef}
                  viewBox="0 0 500 500"
                  className="w-full h-auto aspect-square max-h-[420px]"
                >
                  {/* Grid Lines */}
                  <line x1="250" y1="20" x2="250" y2="480" stroke="#334155" strokeWidth="1.5" strokeDasharray="4" />
                  <line x1="20" y1="250" x2="480" y2="250" stroke="#334155" strokeWidth="1.5" strokeDasharray="4" />

                  {/* Axis Arrows & Labels */}
                  <text x="470" y="245" fill="#94a3b8" fontSize="10" textAnchor="end" fontWeight="bold">
                    {data.xAxisLabel} &rarr;
                  </text>
                  <text x="255" y="35" fill="#94a3b8" fontSize="10" fontWeight="bold">
                    &uarr; {data.yAxisLabel}
                  </text>

                  {/* White-Space Opportunity Radar Highlights */}
                  {data.whiteSpaceGaps.map((gap, i) => {
                    const gx = (gap.coordinates.x / 100) * 440 + 30;
                    const gy = 470 - (gap.coordinates.y / 100) * 440;
                    return (
                      <g key={i} className="animate-pulse">
                        <circle cx={gx} cy={gy} r="32" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.4)" strokeDasharray="3" />
                        <circle cx={gx} cy={gy} r="4" fill="#10b981" />
                        <text x={gx} y={gy - 10} fill="#34d399" fontSize="9" textAnchor="middle" fontWeight="bold">
                          White Space
                        </text>
                      </g>
                    );
                  })}

                  {/* Competitor Nodes */}
                  {data.points.map((pt) => {
                    const px = (pt.x / 100) * 440 + 30;
                    const py = 470 - (pt.y / 100) * 440;
                    const isSelected = selectedPoint?.id === pt.id;
                    const isMain = pt.id === 'pt_main';

                    return (
                      <g
                        key={pt.id}
                        onClick={() => setSelectedPoint(pt)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        {/* Glow halo for selected */}
                        {isSelected && (
                          <circle
                            cx={px}
                            cy={py}
                            r={isMain ? "20" : "16"}
                            fill={isMain ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.2)"}
                          />
                        )}

                        <circle
                          cx={px}
                          cy={py}
                          r={isMain ? "10" : "7"}
                          fill={isMain ? "#6366f1" : isSelected ? "#38bdf8" : "#94a3b8"}
                          stroke={isMain ? "#ffffff" : "#0f172a"}
                          strokeWidth="2"
                        />

                        <text
                          x={px}
                          y={py + 16}
                          fill={isSelected ? "#ffffff" : "#cbd5e1"}
                          fontSize={isMain ? "11" : "10"}
                          fontWeight={isMain || isSelected ? "bold" : "normal"}
                          textAnchor="middle"
                        >
                          {pt.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* Right Column: Node Inspector & White Space Exploits */}
          <div className="lg:col-span-5 space-y-4">
            {/* Selected Node Details */}
            {selectedPoint && (
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <h4 className="text-sm font-bold text-zinc-900">{selectedPoint.name}</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-200 text-zinc-800 rounded uppercase">
                    {selectedPoint.quadrant} Quadrant
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-zinc-200">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">X-Score</span>
                    <span className="text-sm font-bold text-zinc-900">{selectedPoint.x}/100</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-zinc-200">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Y-Score</span>
                    <span className="text-sm font-bold text-zinc-900">{selectedPoint.y}/100</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-[11px] font-bold text-zinc-700 uppercase">Observed Advantage:</span>
                  <p className="text-zinc-600 leading-relaxed bg-white p-2.5 rounded-xl border border-zinc-200">
                    {selectedPoint.keyAdvantage}
                  </p>
                </div>

                <div className="text-xs text-zinc-500 flex items-center justify-between pt-1">
                  <span>Backed by {selectedPoint.evidenceCount} verified claims</span>
                  <span className="text-indigo-600 font-semibold">Real-Time Vector</span>
                </div>
              </div>
            )}

            {/* White Space Exploits List */}
            {data?.whiteSpaceGaps && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Detected White-Space Opportunities</span>
                </h4>

                <div className="space-y-2.5">
                  {data.whiteSpaceGaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950">{gap.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-200/60 text-emerald-900 rounded">
                          Opportunity Gap
                        </span>
                      </div>
                      <p className="text-zinc-700 text-[11px] leading-relaxed">
                        {gap.opportunityDescription}
                      </p>
                      <div className="pt-1 text-[11px] font-semibold text-emerald-900">
                        <span className="text-emerald-700">Exploit Angle: </span>
                        {gap.recommendedProductAngle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
