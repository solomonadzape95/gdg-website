'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, type User } from '@/lib/api';

const TOKEN_KEY = 'gdg_token';

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    storeToken(t);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await api.login({ email, password });
        setToken(res.access_token);
        const me = await api.getMe(res.access_token);
        setUser(me);
      } finally {
        setIsLoading(false);
      }
    },
    [setToken]
  );

  useEffect(() => {
    const t = getStoredToken();
    setTokenState(t);
    if (!t) {
      setIsHydrated(true);
      return;
    }
    api
      .getMe(t)
      .then((u) => {
        setUser(u);
      })
      .catch(() => {
        storeToken(null);
        setTokenState(null);
        setUser(null);
      })
      .finally(() => {
        setIsHydrated(true);
      });
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isHydrated,
    login,
    logout,
    setUser,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
