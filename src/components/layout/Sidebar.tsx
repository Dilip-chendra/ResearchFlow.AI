import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  LayoutDashboard,
  Search,
  Database,
  BrainCircuit,
  Megaphone,
  CheckSquare,
  TestTube2,
  History,
  Settings,
  BookOpen,
  X,
  Plus,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../../lib/api';
import { BrandLogo } from '../brand/BrandLogo';

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setSelectedJobId,
    isMobileNavOpen,
    setIsMobileNavOpen,
    setIsNewResearchModalOpen,
    addToast,
    refreshWorkspaces
  } = useWorkspace();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'research', label: 'Research Jobs', icon: Search },
    { id: 'evidence', label: 'Evidence Explorer', icon: Database },
    { id: 'intelligence', label: 'Intelligence Matrix', icon: BrainCircuit },
    { id: 'campaigns', label: 'Campaign Briefs', icon: Megaphone },
    { id: 'tasks', label: 'Execution Tasks', icon: CheckSquare },
    { id: 'evaluation', label: 'Evaluation & Rubric', icon: TestTube2, badge: '12 TCs' },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'settings', label: 'Settings & Runbook', icon: Settings },
  ];

  const handleNavigate = (id: string) => {
    if (id !== 'research') {
      setSelectedJobId(null);
    }
    setActiveView(id);
    setIsMobileNavOpen(false);
  };

  const handleSeedDemoMobile = async () => {
    try {
      addToast('Loading sample research job...', 'info');
      const res = await api.seedDemo();
      addToast('Loaded "NextGen Resume AI" student campaign demo flow', 'success');
      setSelectedJobId(res.job.id);
      setActiveView('research');
      refreshWorkspaces();
      setIsMobileNavOpen(false);
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  return (
    <>
      {/* Desktop Sticky Sidebar (Hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex md:w-60 lg:w-64 border-r border-zinc-200 bg-zinc-50/50 flex-col justify-between shrink-0 select-none sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden">
        <div className="p-3 space-y-1 flex-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Core Workflows
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* System Topology & Architecture Quick Card */}
        <div className="p-3 pb-6 shrink-0 mt-auto">
          <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/90 via-zinc-900 to-zinc-950 text-white border border-indigo-500/20 shadow-md">
            {/* Subtle ambient glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>System Topology</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>

              <p className="text-[10.5px] text-zinc-300 leading-snug">
                End-to-end evidence pipelines, neural synthesis mesh, and security invariants.
              </p>

              <button
                onClick={() => handleNavigate('architecture')}
                className="w-full text-center py-2 px-2.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 group cursor-pointer"
              >
                <span>Explore Architecture</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay (Slide-over drawer on < md) */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <BrandLogo size="xs" variant="light" showBadge={true} />
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Mobile Drawer */}
            <div className="p-3 border-b border-zinc-100 flex flex-col gap-2 bg-indigo-50/40">
              <button
                onClick={() => {
                  setIsNewResearchModalOpen(true);
                  setIsMobileNavOpen(false);
                }}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>New Research Job</span>
              </button>
              <button
                onClick={handleSeedDemoMobile}
                className="w-full py-2 px-3 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Load Sample Demo Job</span>
              </button>
            </div>

            {/* Nav Links */}
            <div className="p-3 space-y-1 overflow-y-auto flex-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Workflows
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                        : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                          isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="pt-2 border-t border-zinc-100 mt-2">
                <button
                  onClick={() => handleNavigate('architecture')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all min-h-[44px] ${
                    activeView === 'architecture'
                      ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                      : 'text-indigo-600 bg-indigo-50/70 hover:bg-indigo-100 hover:text-indigo-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className={`w-4.5 h-4.5 ${activeView === 'architecture' ? 'text-white' : 'text-indigo-600'}`} />
                    <span>System Topology</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-700 font-bold uppercase">
                    Live
                  </span>
                </button>
              </div>
            </div>

            {/* Footer info */}
            <div className="p-3 border-t border-zinc-200 bg-zinc-50 text-center text-[11px] text-zinc-500">
              <p className="font-semibold text-zinc-700">ResearchFlow AI SaaS</p>
              <p className="text-[10px] mt-0.5">Evidence-backed decisions & execution</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Hidden on md+, visible on mobile for quick access) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'research', label: 'Research', icon: Search },
          { id: 'campaigns', label: 'Briefs', icon: Megaphone },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'evaluation', label: 'Eval', icon: TestTube2 },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors min-h-[44px] min-w-[48px] ${
                isActive ? 'text-indigo-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-indigo-600' : 'text-zinc-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
