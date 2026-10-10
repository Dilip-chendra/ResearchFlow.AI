import React, { useState, useEffect } from 'react';
import { X, Play, ShieldAlert, TrendingDown, ArrowRight, Lightbulb, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import { ScenarioSimulation } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';

interface ScenarioSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitorNames?: string[];
}

export const ScenarioSimulatorModal: React.FC<ScenarioSimulatorModalProps> = ({
  isOpen,
  onClose,
  competitorNames = [],
}) => {
  const { addToast } = useWorkspace();
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [triggerDescription, setTriggerDescription] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState(competitorNames[0] || '');
  const [isRunning, setIsRunning] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<ScenarioSimulation | null>(null);
  const [pastSimulations, setPastSimulations] = useState<ScenarioSimulation[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadPastSimulations();
    }
  }, [isOpen]);

  const loadPastSimulations = async () => {
    try {
      const res = await api.getScenarioSimulations();
      if (res.scenarios) {
        setPastSimulations(res.scenarios);
        if (res.scenarios.length > 0 && !activeSimulation) {
          setActiveSimulation(res.scenarios[0]);
        }
      }
    } catch {
      // Ignored if empty
    }
  };

  if (!isOpen) return null;

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioTitle.trim() || !triggerDescription.trim()) {
      addToast('Please provide a title and trigger description.', 'error');
      return;
    }

    try {
      setIsRunning(true);
      const res = await api.runScenarioSimulation({
        scenarioTitle: scenarioTitle.trim(),
        triggerDescription: triggerDescription.trim(),
        competitorName: selectedCompetitor,
      });

      if (res.simulation) {
        setActiveSimulation(res.simulation);
        setPastSimulations(prev => [res.simulation, ...prev]);
        addToast('Scenario simulation calculated.', 'success');
        setScenarioTitle('');
        setTriggerDescription('');
      }
    } catch (err: any) {
      addToast(err.message || 'Simulation failed', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900">Strategic Scenario Simulator</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                  SIMULATION / FORECAST
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Stress-test competitive shifts, pricing wars, and feature moves with first and second-order effect modeling.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 min-w-0">
          {/* Left Column: Form & History */}
          <div className="md:col-span-5 space-y-5 min-w-0">
            <form onSubmit={handleRunSimulation} className="space-y-3.5 p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 min-w-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 truncate">
                Run What-If Scenario
              </h3>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-600 mb-1">
                  Scenario Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Competitor cuts pricing by 30%"
                  value={scenarioTitle}
                  onChange={e => setScenarioTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-0"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-600 mb-1">
                  Target Competitor
                </label>
                <select
                  value={selectedCompetitor}
                  onChange={e => setSelectedCompetitor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white min-w-0"
                >
                  <option value="">Market-wide / Any Competitor</option>
                  {competitorNames.map(name => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-600 mb-1">
                  Trigger Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Jobscan cuts entry tier pricing from $49.95 to $19.99/mo and advertises a free ATS match scan on social."
                  value={triggerDescription}
                  onChange={e => setTriggerDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-w-0"
                />
              </div>

              <button
                type="submit"
                disabled={isRunning}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isRunning ? 'Calculating Effects...' : 'Run Simulation'}
              </button>
            </form>

            {/* Past Simulations */}
            {pastSimulations.length > 0 && (
              <div className="min-w-0">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5 truncate">
                  <Clock className="w-3 h-3 shrink-0" /> Past Scenarios
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {pastSimulations.map(sim => (
                    <button
                      key={sim.id}
                      onClick={() => setActiveSimulation(sim)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer min-w-0 ${
                        activeSimulation?.id === sim.id
                          ? 'bg-purple-50 border-purple-300 font-semibold text-purple-900'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="truncate font-medium">{sim.scenarioTitle}</div>
                      <div className="text-[10px] text-zinc-400 flex items-center justify-between mt-1 gap-2">
                        <span className="truncate">{sim.competitorName || 'Market-wide'}</span>
                        <span className="shrink-0">{new Date(sim.simulatedAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Simulation Output */}
          <div className="md:col-span-7 min-w-0">
            {activeSimulation ? (
              <div className="space-y-4 min-w-0">
                <div className="p-4 rounded-xl border border-zinc-200 bg-white min-w-0 overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 min-w-0">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold truncate">
                      {activeSimulation.competitorName || 'Market'} Impact Analysis
                    </span>
                    <span className="text-[11px] text-zinc-500 shrink-0">
                      Confidence: <strong>{activeSimulation.confidenceScore}%</strong>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 mb-1 break-words">
                    {activeSimulation.scenarioTitle}
                  </h3>
                  <p className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 break-words">
                    "{activeSimulation.triggerDescription}"
                  </p>
                </div>

                {/* First-Order Effects */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2 min-w-0 overflow-hidden">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5 truncate">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    First-Order Immediate Effects (0–30 Days)
                  </h4>
                  <ul className="space-y-1.5">
                    {activeSimulation.firstOrderEffects.map((effect, idx) => (
                      <li key={idx} className="text-xs text-blue-950 flex items-start gap-2 min-w-0">
                        <span className="text-blue-500 font-bold shrink-0">•</span>
                        <span className="break-words">{effect}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Second-Order Effects */}
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2 min-w-0 overflow-hidden">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5 truncate">
                    <TrendingDown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    Second-Order Downstream Effects (30–90 Days)
                  </h4>
                  <ul className="space-y-1.5">
                    {activeSimulation.secondOrderEffects.map((effect, idx) => (
                      <li key={idx} className="text-xs text-purple-950 flex items-start gap-2 min-w-0">
                        <span className="text-purple-500 font-bold shrink-0">•</span>
                        <span className="break-words">{effect}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Defensive Hedges */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2 min-w-0 overflow-hidden">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 truncate">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Recommended Strategic Hedges & Countermeasures
                  </h4>
                  <ul className="space-y-1.5">
                    {activeSimulation.recommendedHedges.map((hedge, idx) => (
                      <li key={idx} className="text-xs text-emerald-950 flex items-start gap-2 min-w-0">
                        <span className="text-emerald-500 font-bold shrink-0">✓</span>
                        <span className="break-words">{hedge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400">
                <ShieldAlert className="w-10 h-10 mb-2 stroke-1 text-zinc-300" />
                <p className="text-xs font-semibold text-zinc-600">No Simulation Selected</p>
                <p className="text-[11px] text-zinc-400 max-w-xs mt-1">
                  Fill in a what-if scenario on the left to stress-test your strategy against market moves.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
