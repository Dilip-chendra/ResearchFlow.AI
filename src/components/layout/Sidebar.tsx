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
  Sparkles
} from 'lucide-react';
import { api } from '../../lib/api';

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
      <aside className="hidden md:flex md:w-60 lg:w-64 border-r border-zinc-200 bg-zinc-50/50 flex-col justify-between shrink-0 select-none sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
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

        {/* Operator Runbook Quick Card */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-100/60 m-2 rounded-xl">
          <div className="flex items-center gap-2 mb-1 text-xs font-bold text-zinc-900">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Operator Runbook</span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-snug mb-2">
            5-Day validation architecture with zero fake metrics.
          </p>
          <button
            onClick={() => handleNavigate('settings')}
            className="w-full text-center py-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-800 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors shadow-2xs"
          >
            View Architecture
          </button>
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
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-900">ResearchFlow.AI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded uppercase">
                  Menu
                </span>
              </div>
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
            </div>

            {/* Footer info */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 text-center text-[11px] text-zinc-500">
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
