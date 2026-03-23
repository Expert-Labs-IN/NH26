import { createContext, useContext } from 'react';
import type { MeResponse } from '@/@types/interface/auth.interface';

interface AuthContextType {
  user: MeResponse | null;
  loading: boolean;
  login: (token: string, userData?: MeResponse) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isWorker: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
