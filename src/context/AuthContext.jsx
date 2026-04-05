/**
 * SR MVP — Auth Context (Fase 2, Dummy / MSW only)
 * Tim 6 Fase 2 | src/context/AuthContext.jsx
 *
 * Autentikasi menggunakan login form + MSW handler (/auth/login).
 * Keycloak SSO dihapus dari scope (keputusan Fase 2).
 * Jika di masa depan perlu SSO, implementasikan ulang di sini
 * dengan interface yang identik sehingga komponen tidak perlu diubah.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Pulihkan sesi dari localStorage (dummy / MSW mode)
    const saved = localStorage.getItem('sr_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem('sr_user'); }
    }
    setIsLoading(false);

    // Dengarkan event unauthorized dari api/client.js
    const onUnauth = () => setUser(null);
    window.addEventListener('sr:unauthorized', onUnauth);
    return () => window.removeEventListener('sr:unauthorized', onUnauth);
  }, []);

  const login = useCallback(async (email, password, role) => {
    const res = await authApi.login({ email, password, role });
    localStorage.setItem('sr_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    localStorage.removeItem('sr_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem('sr_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      role:       user?.role ?? null,
      isLoading,
      isLoggedIn: !!user,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
};
