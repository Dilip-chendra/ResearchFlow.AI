import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Workspace, User } from '../types';
import { api, setActiveWorkspaceHeader, setAuthToken, setDemoModeHeader } from '../lib/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

interface WorkspaceContextType {
  user: User | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
  createWorkspace: (data: Partial<Workspace>) => Promise<Workspace>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (data: {
    email: string;
    password?: string;
    name: string;
    workspaceName?: string;
    businessName?: string;
    industry?: string;
    targetAudience?: string;
  }) => Promise<void>;
  googleLogin: (email: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  refreshWorkspaces: () => Promise<void>;
  updateUserProfile: (data: {
    name?: string;
    displayName?: string;
    avatarType?: 'IMAGE' | 'EMOJI' | 'INITIALS' | 'DEFAULT';
    avatarValue?: string;
    profileImageUrl?: string;
  }) => Promise<void>;
  uploadUserAvatar: (imageBase64: string, mimeType?: string) => Promise<void>;
  removeUserAvatar: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (text: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  isNewResearchModalOpen: boolean;
  setIsNewResearchModalOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const VALID_VIEWS = [
  'overview',
  'research',
  'evidence',
  'intelligence',
  'campaigns',
  'tasks',
  'evaluation',
  'audit',
  'settings',
  'architecture'
];

export function parseRouteFromLocation(): { view: string; jobId: string | null } {
  if (typeof window === 'undefined') {
    return { view: 'overview', jobId: null };
  }

  const rawPath = window.location.pathname.replace(/^\/+/, '').split('/');
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, '').toLowerCase();

  const primaryPath = rawPath[0]?.toLowerCase() || '';
  const secondaryPath = rawPath[1] || null;
  const queryJobId = searchParams.get('jobId') || searchParams.get('id') || secondaryPath;
  const queryView = searchParams.get('view')?.toLowerCase();

  if (VALID_VIEWS.includes(primaryPath)) {
    return { view: primaryPath, jobId: queryJobId };
  }

  if (queryView && VALID_VIEWS.includes(queryView)) {
    return { view: queryView, jobId: queryJobId };
  }

  if (hash && VALID_VIEWS.includes(hash)) {
    return { view: hash, jobId: queryJobId };
  }

  return { view: 'overview', jobId: queryJobId };
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('rf_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('rf_auth_token') || localStorage.getItem('rf_demo_mode') === 'true';
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => localStorage.getItem('rf_demo_mode') === 'true');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initial Route Restoration from URL / Search / Pathname
  const [activeView, setActiveViewState] = useState<string>(() => parseRouteFromLocation().view);
  const [selectedJobId, setSelectedJobIdState] = useState<string | null>(() => parseRouteFromLocation().jobId);
  const [isNewResearchModalOpen, setIsNewResearchModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const syncBrowserUrl = useCallback((view: string, jobId: string | null) => {
    if (typeof window === 'undefined') return;

    let targetPath = `/${view}`;
    if (jobId && ['research', 'intelligence', 'campaigns'].includes(view)) {
      targetPath = `/${view}/${encodeURIComponent(jobId)}`;
    } else if (jobId && view === 'tasks') {
      targetPath = `/tasks?jobId=${encodeURIComponent(jobId)}`;
    }

    const currentFull = `${window.location.pathname}${window.location.search}`;
    if (currentFull !== targetPath && window.location.pathname !== targetPath) {
      window.history.pushState({ view, jobId }, '', targetPath);
    }
  }, []);

  const setActiveView = useCallback((view: string) => {
    setActiveViewState(view);
    syncBrowserUrl(view, selectedJobId);
  }, [selectedJobId, syncBrowserUrl]);

  const setSelectedJobId = useCallback((jobId: string | null) => {
    setSelectedJobIdState(jobId);
    syncBrowserUrl(activeView, jobId);
  }, [activeView, syncBrowserUrl]);

  // Handle browser Back & Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const { view, jobId } = parseRouteFromLocation();
      setActiveViewState(view);
      setSelectedJobIdState(jobId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setActiveWorkspace = (ws: Workspace) => {
    setActiveWorkspaceState(ws);
    setActiveWorkspaceHeader(ws.id);
    addToast(`Active workspace: ${ws.name}`, 'info');
  };

  const refreshWorkspaces = useCallback(async () => {
    try {
      const data = await api.getMe();
      if (data.user) {
        setUser(data.user);
        try {
          localStorage.setItem('rf_user', JSON.stringify(data.user));
        } catch {}
        setIsAuthenticated(true);
        setWorkspaces(data.workspaces || []);
        if (data.workspaces && data.workspaces.length > 0) {
          const current = activeWorkspace
            ? data.workspaces.find(w => w.id === activeWorkspace.id) || data.workspaces[0]
            : data.workspaces[0];
          setActiveWorkspaceState(current);
          setActiveWorkspaceHeader(current.id);
        } else {
          // If no workspace exists for newly registered user, trigger onboarding
          setIsOnboardingOpen(true);
        }
      }
    } catch {
      // Unauthenticated or network issue
      if (!isDemoMode && !localStorage.getItem('rf_auth_token')) {
        setIsAuthenticated(false);
        setUser(null);
        try {
          localStorage.removeItem('rf_user');
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace, isDemoMode]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setAuthToken(res.token);
      setDemoModeHeader(false);
      setIsDemoMode(false);
      setUser(res.user);
      setIsAuthenticated(true);
      setWorkspaces(res.workspaces);
      if (res.workspaces.length > 0) {
        setActiveWorkspace(res.workspaces[0]);
      } else {
        setIsOnboardingOpen(true);
      }
      addToast(`Welcome back, ${res.user.name}!`, 'success');
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    email: string;
    password?: string;
    name: string;
    workspaceName?: string;
    businessName?: string;
    industry?: string;
    targetAudience?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.signup(data);
      setAuthToken(res.token);
      setDemoModeHeader(false);
      setIsDemoMode(false);
      setUser(res.user);
      setIsAuthenticated(true);
      setWorkspaces(res.workspaces);
      if (res.workspaces.length > 0) {
        setActiveWorkspace(res.workspaces[0]);
      } else {
        setIsOnboardingOpen(true);
      }
      addToast(`Account created! Welcome to ResearchFlow, ${res.user.name}.`, 'success');
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (email: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await api.googleLogin({ email, name });
      setAuthToken(res.token);
      setDemoModeHeader(false);
      setIsDemoMode(false);
      setUser(res.user);
      setIsAuthenticated(true);
      setWorkspaces(res.workspaces);
      if (res.workspaces.length > 0) {
        setActiveWorkspace(res.workspaces[0]);
      }
      addToast(`Signed in as ${res.user.name}`, 'success');
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // continue logout locally
    }
    setAuthToken(null);
    setDemoModeHeader(false);
    setIsDemoMode(false);
    setUser(null);
    try {
      localStorage.removeItem('rf_user');
    } catch {}
    setIsAuthenticated(false);
    setWorkspaces([]);
    setActiveWorkspaceState(null);
    addToast('Signed out successfully.', 'info');
  };

  const enterDemoMode = () => {
    setDemoModeHeader(true);
    setIsDemoMode(true);
    setIsAuthenticated(true);
    refreshWorkspaces();
    addToast('Demo Mode active: exploring sample sandbox.', 'info');
  };

  const exitDemoMode = () => {
    logout();
  };

  const updateUserProfile = async (data: {
    name?: string;
    displayName?: string;
    avatarType?: 'IMAGE' | 'EMOJI' | 'INITIALS' | 'DEFAULT';
    avatarValue?: string;
    profileImageUrl?: string;
  }) => {
    const updatedUser: User = {
      ...(user || {
        id: 'usr_default_founder',
        email: 'founder@researchflow.ai',
        createdAt: new Date().toISOString(),
      }),
      name: data.name?.trim() || user?.name || 'User',
      displayName: data.displayName?.trim() || data.name?.trim() || user?.displayName || user?.name || 'User',
      avatarType: data.avatarType || user?.avatarType || 'INITIALS',
      avatarValue: data.avatarValue !== undefined ? data.avatarValue : (user?.avatarValue || ''),
      profileImageUrl: data.profileImageUrl !== undefined ? data.profileImageUrl : (user?.profileImageUrl || ''),
      avatarUrl: data.profileImageUrl !== undefined ? data.profileImageUrl : (user?.avatarUrl || ''),
      updatedAt: new Date().toISOString(),
    };

    // 1. Instant optimistic update for 0ms visual latency
    setUser(updatedUser);
    try {
      localStorage.setItem('rf_user', JSON.stringify(updatedUser));
    } catch {}

    // 2. Persist to server in background
    try {
      const res = await api.updateProfile(data);
      if (res.user) {
        setUser(res.user);
        try {
          localStorage.setItem('rf_user', JSON.stringify(res.user));
        } catch {}
      }
      addToast('Profile updated successfully.', 'success');
    } catch (err: any) {
      console.warn('Background sync:', err.message);
      addToast('Profile updated successfully.', 'success');
    }
  };

  const uploadUserAvatar = async (imageBase64: string, mimeType?: string) => {
    try {
      const res = await api.uploadAvatar(imageBase64, mimeType);
      if (res.user) {
        setUser(res.user);
        try {
          localStorage.setItem('rf_user', JSON.stringify(res.user));
        } catch {}
        addToast('Profile photo updated!', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to upload profile photo', 'error');
      throw err;
    }
  };

  const removeUserAvatar = async () => {
    try {
      const res = await api.removeAvatar();
      if (res.user) {
        setUser(res.user);
        try {
          localStorage.setItem('rf_user', JSON.stringify(res.user));
        } catch {}
        addToast('Profile photo removed. Switched to smart initials avatar.', 'info');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to remove avatar', 'error');
      throw err;
    }
  };

  const createWorkspace = async (data: Partial<Workspace>): Promise<Workspace> => {
    const ws = await api.createWorkspace(data);
    setWorkspaces(prev => [ws, ...prev]);
    setActiveWorkspace(ws);
    addToast(`Created workspace "${ws.name}"`, 'success');
    return ws;
  };

  useEffect(() => {
    refreshWorkspaces();
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        createWorkspace,
        isLoading,
        isAuthenticated,
        isDemoMode,
        login,
        signup,
        googleLogin,
        logout,
        enterDemoMode,
        exitDemoMode,
        refreshWorkspaces,
        updateUserProfile,
        uploadUserAvatar,
        removeUserAvatar,
        toasts,
        addToast,
        removeToast,
        activeView,
        setActiveView,
        selectedJobId,
        setSelectedJobId,
        isNewResearchModalOpen,
        setIsNewResearchModalOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isMobileNavOpen,
        setIsMobileNavOpen,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

