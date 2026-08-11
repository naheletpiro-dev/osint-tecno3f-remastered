import { create } from 'zustand';

const getInitialUser = () => {
  try {
    const sessionUser = sessionStorage.getItem('osint_user');
    if (sessionUser) return JSON.parse(sessionUser);

    const persistentUser = localStorage.getItem('osint_user');
    if (persistentUser) return JSON.parse(persistentUser);
  } catch (e) {
    console.error('Error loading user from storage', e);
  }
  return null;
};

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('osint-theme') || 'dark';
  }
  return 'dark';
};

export const useOsintStore = create((set, get) => ({
  // Core Data
  report: null,
  comparisonReport: null,
  history: [],
  user: getInitialUser(),
  theme: getInitialTheme(),

  // UI State
  loading: false,
  error: null,
  scanProgress: 0,
  scanStageText: 'Iniciando rastreo OSINT...',
  showHistoryOnly: false,

  // Actions
  setReport: (report) => set({ report }),
  setComparisonReport: (comparisonReport) => set({ comparisonReport }),
  setHistory: (history) => set({ history }),
  setLoading: (loading) => {
    if (!loading) {
      set({ loading, scanProgress: 0, scanStageText: 'Iniciando rastreo OSINT...' });
    } else {
      set({ loading });
    }
  },
  setError: (error) => set({ error }),
  setScanProgress: (scanProgress) => set({ scanProgress }),
  setScanStageText: (scanStageText) => set({ scanStageText }),
  setShowHistoryOnly: (showHistoryOnly) => set({ showHistoryOnly }),
  
  // Theme Action
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('osint-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return { theme: newTheme };
    });
  },

  // Auth Actions
  login: (userData, keepSession = false) => {
    try {
      if (keepSession) {
        localStorage.setItem('osint_user', JSON.stringify(userData));
        sessionStorage.removeItem('osint_user');
      } else {
        sessionStorage.setItem('osint_user', JSON.stringify(userData));
        localStorage.removeItem('osint_user');
      }
    } catch (e) {
      console.error('Error saving session', e);
    }
    set({ user: userData });
  },

  logout: () => {
    try {
      sessionStorage.removeItem('osint_user');
      localStorage.removeItem('osint_user');
    } catch (e) {}
    set({ 
      user: null, 
      report: null, 
      comparisonReport: null, 
      showHistoryOnly: false,
      history: []
    });
  },

  resetState: () => {
    set({
      report: null,
      comparisonReport: null,
      error: null,
      showHistoryOnly: false
    });
  },
}));
