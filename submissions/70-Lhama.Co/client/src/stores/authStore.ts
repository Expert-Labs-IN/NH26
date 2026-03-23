import { create } from 'zustand';
import {
  fetchAuthStatus,
  logoutOutlook,
  logoutGmail,
  type AuthStatus,
} from '../api/auth';

interface AuthStore {
  status: AuthStatus;
  isChecking: boolean;

  checkStatus: () => Promise<void>;
  logoutOutlook: () => Promise<void>;
  logoutGmail: () => Promise<void>;
}

const DEFAULT_STATUS: AuthStatus = {
  outlook: { connected: false, configured: false },
  gmail: { connected: false, configured: false },
};

export const useAuthStore = create<AuthStore>((set) => ({
  status: DEFAULT_STATUS,
  isChecking: false,

  checkStatus: async () => {
    set({ isChecking: true });
    try {
      const status = await fetchAuthStatus();
      set({ status, isChecking: false });
    } catch {
      set({ isChecking: false });
    }
  },

  logoutOutlook: async () => {
    await logoutOutlook();
    set((s) => ({
      status: {
        ...s.status,
        outlook: { connected: false, configured: s.status.outlook.configured },
      },
    }));
  },

  logoutGmail: async () => {
    await logoutGmail();
    set((s) => ({
      status: {
        ...s.status,
        gmail: { connected: false, configured: s.status.gmail.configured },
      },
    }));
  },
}));
