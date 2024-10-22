import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UserSession } from '@stacks/auth';

interface AuthContextType {
  userSession: UserSession;
  userData: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useUserData(): any {
  const { userData } = useAuth();
  return userData;
}
