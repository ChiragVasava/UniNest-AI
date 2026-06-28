'use client';

/**
 * Auth Context - Manages authentication state globally
 * Stores JWT token, user info, and auth functions
 */

import React, { createContext, useContext, useLayoutEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { AuthUser } from '@/lib/types';

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthSnapshot {
  token: string | null;
  user: AuthUser | null;
}

const AUTH_CHANGE_EVENT = 'uninest-auth-change';

const EMPTY_AUTH_SNAPSHOT_STRING = '{"token":null,"user":null}';

function readAuthSnapshotString(): string {
  if (typeof window === 'undefined') {
    return EMPTY_AUTH_SNAPSHOT_STRING;
  }

  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!storedToken || !storedUser) {
    return EMPTY_AUTH_SNAPSHOT_STRING;
  }

  try {
    return JSON.stringify({ token: storedToken, user: JSON.parse(storedUser) as AuthUser });
  } catch {
    return EMPTY_AUTH_SNAPSHOT_STRING;
  }
}

function subscribeToAuthChanges(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'token' || event.key === 'user' || event.key === null) {
      onStoreChange();
    }
  };

  const handleCustomEvent = () => onStoreChange();

  window.addEventListener('storage', handleStorage);
  window.addEventListener(AUTH_CHANGE_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(AUTH_CHANGE_EVENT, handleCustomEvent);
  };
}

function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasHydrated, setHasHydrated] = useState(false);

  // Use a synchronous layout effect so test injection (via addInitScript)
  // is honored before React effects run and ProtectedRoute checks occur.
  useLayoutEffect(() => {
    // If a test injected auth via `window.__TEST_INJECT_AUTH`, notify subscribers
    // immediately so automated tests can set localStorage before routing.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof window !== 'undefined' && window.__TEST_INJECT_AUTH) {
      try {
        notifyAuthChange();
      } catch {}
    }

    setHasHydrated(true);
  }, []);

  const authSnapshotString = useSyncExternalStore(
    subscribeToAuthChanges,
    readAuthSnapshotString,
    () => EMPTY_AUTH_SNAPSHOT_STRING
  );

  const authSnapshot = useMemo<AuthSnapshot>(() => {
    try {
      return JSON.parse(authSnapshotString) as AuthSnapshot;
    } catch {
      return { token: null, user: null };
    }
  }, [authSnapshotString]);

  const { token, user } = authSnapshot;
  const isLoading = !hasHydrated;

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    notifyAuthChange();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    notifyAuthChange();
  };

  const value = {
    token,
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
