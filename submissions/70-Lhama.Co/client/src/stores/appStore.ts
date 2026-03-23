import { create } from 'zustand';
import type { PriorityTag } from '../types';

export type InboxFilter = 'all' | 'Urgent' | 'Requires Action' | 'FYI' | 'spam';
export type LoginMode = 'gmail' | 'outlook' | 'guest' | null;

interface AppStore {
  darkMode: boolean;
  showAuditLog: boolean;
  inboxFilter: InboxFilter;
  sortByPriority: boolean;
  isLoggedIn: boolean;
  loginMode: LoginMode;

  toggleDarkMode: () => void;
  toggleAuditLog: () => void;
  setInboxFilter: (filter: InboxFilter) => void;
  togglePrioritySort: () => void;
  setLoggedIn: (mode: LoginMode) => void;
  logout: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  darkMode: false,
  showAuditLog: false,
  inboxFilter: 'all',
  sortByPriority: true,
  isLoggedIn: false,
  loginMode: null,

  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { darkMode: next };
    }),

  toggleAuditLog: () => set((s) => ({ showAuditLog: !s.showAuditLog })),

  setInboxFilter: (filter: InboxFilter) => set({ inboxFilter: filter }),

  togglePrioritySort: () => set((s) => ({ sortByPriority: !s.sortByPriority })),

  setLoggedIn: (mode: LoginMode) => set({ isLoggedIn: true, loginMode: mode }),

  logout: () => set({ isLoggedIn: false, loginMode: null }),
}));
