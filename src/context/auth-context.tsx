'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  verify: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setAccessToken(null);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      router.push('/');
    }
  }, [router]);

  // Refresh token function
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setAccessToken(data.accessToken);
        setUser(data.user);
        // Schedule next refresh (e.g., in 14 minutes for a 15m token)
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(refresh, 14 * 60 * 1000);
        return data.accessToken;
      } else {
        await logout();
      }
    } catch (err) {
      await logout();
    }
  }, [logout]);

  // Initial load: Attempt refresh
  useEffect(() => {
    refresh().finally(() => setLoading(false));
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [refresh]);

  // Verify function
  const verify = async (email: string, token: string) => {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    setUser(data.user);
    setAccessToken(data.accessToken);

    // Start refresh timer
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(refresh, 14 * 60 * 1000);
  };

  const login = async (email: string) => {
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
  };

  const value = {
    user,
    accessToken,
    loading,
    login,
    verify,
    logout,
    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
