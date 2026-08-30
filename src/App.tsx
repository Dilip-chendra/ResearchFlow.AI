import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { ResearchListView } from './components/research/ResearchListView';
import { EvidenceExplorerView } from './components/evidence/EvidenceExplorerView';
import { IntelligenceView } from './components/intelligence/IntelligenceView';
import { CampaignsView } from './components/campaigns/CampaignsView';
import { TasksView } from './components/tasks/TasksView';
import { EvaluationView } from './components/evaluation/EvaluationView';
import { AuditView } from './components/audit/AuditView';
import { SettingsView } from './components/settings/SettingsView';
import { NewResearchModal } from './components/research/NewResearchModal';
import { AuthView } from './components/auth/AuthView';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { X, CheckCircle2, AlertTriangle, Info, Sparkles } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useWorkspace();

  return (
    <div className="fixed bottom-16 sm:bottom-4 right-3 left-3 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 max-w-sm sm:w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-2.5 text-xs transition-all animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-emerald-900 text-white border-emerald-800'
                : isError
                ? 'bg-rose-900 text-white border-rose-800'
                : isWarning
                ? 'bg-amber-900 text-white border-amber-800'
                : 'bg-zinc-900 text-white border-zinc-800'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {isError && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
            {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}

            <div className="flex-1 leading-snug">{toast.text || (toast as any).message}</div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

const MainApp: React.FC = () => {
  const { activeView, isAuthenticated, isLoading } = useWorkspace();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium tracking-wide text-slate-400">Loading ResearchFlow Workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthView />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100/60 flex flex-col text-zinc-900 font-sans antialiased">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-10 pb-24 md:pb-10 max-w-7xl w-full mx-auto overflow-x-hidden overflow-y-auto">
          {activeView === 'overview' && <OverviewDashboard />}
          {activeView === 'research' && <ResearchListView />}
          {activeView === 'evidence' && <EvidenceExplorerView />}
          {activeView === 'intelligence' && <IntelligenceView />}
          {activeView === 'campaigns' && <CampaignsView />}
          {activeView === 'tasks' && <TasksView />}
          {activeView === 'evaluation' && <EvaluationView />}
          {activeView === 'audit' && <AuditView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      <NewResearchModal />
      <OnboardingModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <MainApp />
    </WorkspaceProvider>
  );
}

