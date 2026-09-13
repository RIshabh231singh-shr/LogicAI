import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../api/projects';
import { systemApi } from '../api/system';
import { authApi } from '../api/auth';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('overview'); // overview, projects, projectDetails, documents, documentViewer, analysis, comparison, evaluation, observability, settings
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [systemHealth, setSystemHealth] = useState({ gateway: 'checking', ai: 'checking' });
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    async function checkAuth() {
      if (authApi.isAuthenticated()) {
        try {
          const res = await authApi.getMe();
          if (res && res.user) {
            setCurrentUser(res.user);
          } else {
            authApi.logout();
            setCurrentUser(null);
          }
        } catch (err) {
          console.warn('Auth check failed, clearing token:', err.message);
          authApi.logout();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    }
    checkAuth();
  }, []);

  const fetchProjects = useCallback(async () => {
    if (!currentUser) {
      setProjects([]);
      return;
    }
    setLoadingProjects(true);
    try {
      const data = await projectsApi.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId((prev) => {
          if (prev && data.some((p) => p.id === prev)) return prev;
          return data[0].id;
        });
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }, [currentUser]);

  const checkHealth = useCallback(async () => {
    try {
      const gRes = await systemApi.checkBackendHealth();
      setSystemHealth((prev) => ({ ...prev, gateway: gRes.status === 'ok' ? 'online' : 'error' }));
    } catch {
      setSystemHealth((prev) => ({ ...prev, gateway: 'offline' }));
    }

    try {
      const aRes = await systemApi.checkAiHealth();
      setSystemHealth((prev) => ({ ...prev, ai: aRes.status === 'ok' ? 'online' : 'error' }));
    } catch {
      setSystemHealth((prev) => ({ ...prev, ai: 'offline' }));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [currentUser, fetchProjects]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 120000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Global Keyboard shortcuts (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loginUser = (user) => {
    setCurrentUser(user);
    setCurrentRoute('overview');
  };

  const logoutUser = () => {
    authApi.logout();
    setCurrentUser(null);
    setProjects([]);
    setSelectedProjectId(null);
    setSelectedDocument(null);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  const navigateTo = (route, params = {}) => {
    if (params.projectId) {
      setSelectedProjectId(params.projectId);
    }
    if (params.document) {
      setSelectedDocument(params.document);
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentUser,
        authLoading,
        isAuthenticated: Boolean(currentUser),
        loginUser,
        logoutUser,
        currentRoute,
        setCurrentRoute: navigateTo,
        projects,
        selectedProject,
        selectedProjectId,
        setSelectedProjectId,
        selectedDocument,
        setSelectedDocument,
        loadingProjects,
        refreshProjects: fetchProjects,
        systemHealth,
        globalSearchOpen,
        setGlobalSearchOpen,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return ctx;
}
