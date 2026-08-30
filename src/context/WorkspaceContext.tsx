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

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => localStorage.getItem('rf_demo_mode') === 'true');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeView, setActiveView] = useState<string>('overview');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isNewResearchModalOpen, setIsNewResearchModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

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

