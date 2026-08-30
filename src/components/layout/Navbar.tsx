import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { GlobalSearchBar } from './GlobalSearchBar';
import {
  Layers,
  Plus,
  Sparkles,
  Building2,
  ChevronDown,
  Check,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  Clock,
  TrendingUp
} from 'lucide-react';
import { api } from '../../lib/api';

export const Navbar: React.FC = () => {
  const {
    user,
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    setIsNewResearchModalOpen,
    isOnboardingOpen,
    setIsOnboardingOpen,
    isDemoMode,
    logout,
    addToast,
    setSelectedJobId,
    setActiveView,
    refreshWorkspaces,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = useWorkspace();

  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch {
      // silent fallback
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [activeWorkspace?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast('Marked all notifications as read', 'info');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleNotificationClick = async (notif: any) => {
    try {
      if (!notif.read) {
        await api.markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      }
      setIsNotifOpen(false);
      if (notif.researchJobId) {
        setSelectedJobId(notif.researchJobId);
        setActiveView('research');
      } else if (notif.category === 'COMPETITIVE_CHANGE') {
        setActiveView('competitive');
      } else if (notif.category === 'REVIEW_REQUESTED') {
        setActiveView('campaigns');
      }
    } catch {
      // ignore
    }
  };

  const handleSeedDemo = async () => {
    try {
      setIsSeedingDemo(true);
      const res = await api.seedDemo();
      addToast('Loaded "NextGen Resume AI" student campaign demo flow', 'success');
      setSelectedJobId(res.job.id);
      setActiveView('research');
      refreshWorkspaces();
      setIsMobileNavOpen(false);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsSeedingDemo(false);
    }
  };

  return (
    <header className="h-16 border-b border-zinc-200 bg-white/95 backdrop-blur-xs sticky top-0 z-30 px-3 sm:px-4 lg:px-6 flex items-center justify-between">
      {/* Brand Identity & Mobile Menu Toggle */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Mobile Hamburger Toggle */}
        <button
          id="btn-mobile-nav-toggle"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div
          onClick={() => {
            setSelectedJobId(null);
            setActiveView('overview');
            setIsMobileNavOpen(false);
          }}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors shrink-0">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-zinc-900">
                ResearchFlow<span className="text-indigo-600">.AI</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded border border-zinc-200 uppercase">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-600 hidden lg:block">
              Evidence-Backed Decisions & Execution
            </p>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="relative">
          <button
            id="btn-workspace-switcher"
            onClick={() => setIsWsDropdownOpen(!isWsDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-zinc-50/70 hover:bg-zinc-100/70 text-xs font-medium text-zinc-800 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="max-w-[80px] sm:max-w-[140px] truncate font-semibold">
              {activeWorkspace?.name || 'Acme Growth Labs'}
            </span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400 shrink-0" />
          </button>

          {isWsDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-xl border border-zinc-200 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setIsWsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-50 text-zinc-800"
                >
                  <div className="truncate pr-2">
                    <p className="font-medium text-zinc-900 truncate">{ws.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{ws.businessName}</p>
                  </div>
                  {activeWorkspace?.id === ws.id && (
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global Search Bar */}
      <GlobalSearchBar />

      {/* Action CTA Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tenant Isolated</span>
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            id="btn-notifications-toggle"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-80 sm:w-96 bg-white rounded-xl border border-zinc-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 overflow-hidden">
              <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-zinc-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-zinc-600 text-xs">
                    <Bell className="w-6 h-6 mx-auto mb-2 text-zinc-300" />
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 text-xs cursor-pointer transition-colors hover:bg-zinc-50 ${
                        !n.read ? 'bg-indigo-50/40 border-l-2 border-l-indigo-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 shrink-0">
                          {n.category === 'COMPETITIVE_CHANGE' ? (
                            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                          ) : n.category === 'SOURCE_HEALTH' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Info className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-zinc-900 truncate">{n.title}</p>
                          <p className="text-zinc-600 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          id="btn-seed-demo"
          onClick={handleSeedDemo}
          disabled={isSeedingDemo}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors border border-zinc-200/80"
          title="Seed end-to-end sample research job for AI Resume Builder"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{isSeedingDemo ? 'Loading...' : 'Sample Job'}</span>
        </button>

        {/* User Account & Logout */}
        <div className="relative">
          <button
            id="btn-user-profile-menu"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name || 'User Profile'}
              className="w-7 h-7 rounded-full object-cover border border-zinc-300"
            />
            <ChevronDown className="w-3 h-3 text-zinc-500 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-xl border border-zinc-200 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
              <div className="px-3 py-2 border-b border-zinc-100">
                <p className="font-semibold text-zinc-900 truncate">{user?.name || 'Founder'}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user?.email || 'founder@growthlabs.io'}</p>
                {isDemoMode && (
                  <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Demo Mode Sandbox
                  </span>
                )}
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsOnboardingOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 text-zinc-700 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Create New Workspace</span>
                </button>
              </div>

              <div className="border-t border-zinc-100 pt-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isDemoMode ? 'Exit Demo Sandbox' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
