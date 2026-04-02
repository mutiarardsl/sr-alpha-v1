/**
 * SR MVP — Auth Store (Zustand)
 * Tim 6 Fase 2 | src/stores/authStore.js
 *
 * Global state untuk data user yang sudah login.
 * Sinkron dengan AuthContext — AuthProvider menulis ke sini,
 * komponen yang butuh user info baca dari sini (lebih efisien, no prop drilling).
 */

import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user:      null,
  role:      null,
  isLoading: true,

  setUser: (user) => set({ user, role: user?.role ?? null }),
  setLoading: (v)  => set({ isLoading: v }),
  clear:      ()   => set({ user: null, role: null }),
}));
