import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authApi, type LoginPayload, type RegisterPayload } from '../features/auth/api';
import { tokenStore } from '../services/token-store';
import type { PublicUser } from '../types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: PublicUser | null;
  status: AuthStatus;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // On first load, the access token is gone (it only ever lived in memory),
  // but the httpOnly refresh cookie may still be valid - so we attempt one
  // silent refresh before deciding the user is logged out.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const { user: restoredUser, accessToken } = await authApi.refresh();
        if (cancelled) return;
        tokenStore.set(accessToken);
        setUser(restoredUser);
        setStatus('authenticated');
      } catch {
        if (cancelled) return;
        tokenStore.set(null);
        setUser(null);
        setStatus('unauthenticated');
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: loggedInUser, accessToken } = await authApi.login(payload);
    tokenStore.set(accessToken);
    setUser(loggedInUser);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: registeredUser, accessToken } = await authApi.register(payload);
    tokenStore.set(accessToken);
    setUser(registeredUser);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStore.set(null);
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- conventional context+hook co-location
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
