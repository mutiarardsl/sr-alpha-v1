/**
 * SR MVP — Auth Context (Fase 2 + Keycloak-ready)
 * Tim 6 Fase 2 | src/context/AuthContext.jsx
 *
 * Mendukung dua mode:
 *   VITE_USE_KEYCLOAK=false → login form dummy (Fase 2 default)
 *   VITE_USE_KEYCLOAK=true  → Keycloak SSO (Fase 3+)
 *
 * Interface IDENTIK di kedua mode — komponen tidak perlu diubah saat migrasi.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';
import keycloak, { getRoleFromToken } from '../keycloak';

const USE_KEYCLOAK = import.meta.env.VITE_USE_KEYCLOAK === 'true';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (USE_KEYCLOAK && keycloak?.authenticated) {
      setUser({
        id:         keycloak.subject,
        nama:       keycloak.tokenParsed?.name ?? keycloak.tokenParsed?.preferred_username,
        email:      keycloak.tokenParsed?.email,
        role:       getRoleFromToken(),
        sekolah_id: keycloak.tokenParsed?.sekolah_id ?? null,
      });
      keycloak.onAuthLogout = () => setUser(null);
      setIsLoading(false);
      return;
    }

    const saved = localStorage.getItem('sr_user');
    if (saved) { try { setUser(JSON.parse(saved)); } catch {} }
    setIsLoading(false);

    const onUnauth = () => setUser(null);
    window.addEventListener('sr:unauthorized', onUnauth);
    return () => window.removeEventListener('sr:unauthorized', onUnauth);
  }, []);

  const login = useCallback(async (email, password, role) => {
    if (USE_KEYCLOAK && keycloak) {
      await keycloak.login({ redirectUri: window.location.origin });
      return;
    }
    const res = await authApi.login({ email, password, role });
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    if (USE_KEYCLOAK && keycloak) {
      await keycloak.logout({ redirectUri: window.location.origin });
      return;
    }
    await authApi.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser(prev => {
      const next = { ...prev, ...partial };
      if (!USE_KEYCLOAK) localStorage.setItem('sr_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, isLoading, isLoggedIn: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
};
